const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();

const stripeSecret = process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret;
let stripe = null;
if (stripeSecret) {
  stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });
} else {
  console.warn('STRIPE_SECRET_KEY not set. Set via: firebase functions:config:set stripe.secret="sk_..."');
}

/**
 * Charge for trip confirmation (pay-per-trip plan).
 * $2 base + $1 per collaborator already on the trip at confirmation.
 * Called when user confirms trip name and dates.
 */
exports.chargeTripConfirmation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { planId, tripName, startDate, endDate, collaboratorCount = 0 } = data;
  if (!planId || !tripName || !startDate || !endDate) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  const userId = context.auth.uid;

  // Verify user has pay_per_trip plan
  const licenseSnap = await admin.firestore().doc(`licenses/${userId}`).get();
  const license = licenseSnap.data();
  if (!license || license.plan !== 'pay_per_trip') {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Pay-per-trip plan required. Add payment method first.'
    );
  }

  const stripeCustomerId = license.stripeCustomerId;
  const paymentMethodId = license.stripePaymentMethodId || license.defaultPaymentMethod;
  if (!stripeCustomerId || !paymentMethodId) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'No payment method on file. Please add a card in your account settings.'
    );
  }

  if (!stripe) {
    throw new functions.https.HttpsError('failed-precondition', 'Payment system not configured.');
  }

  // $2 base + $1 per collaborator (creator is not charged as collaborator; collaborators = others)
  const amountCents = (2 + collaboratorCount) * 100; // 200 + 100*collaboratorCount

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true },
      metadata: {
        type: 'trip_confirmation',
        planId,
        userId,
        tripName,
      },
    });

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not completed: ${paymentIntent.status}`);
    }

    // Record the charge in Firestore for audit
    await admin.firestore().collection('charges').add({
      userId,
      planId,
      type: 'trip_confirmation',
      amountCents,
      stripePaymentIntentId: paymentIntent.id,
      tripName,
      collaboratorCount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (err) {
    console.error('Stripe charge error:', err);
    throw new functions.https.HttpsError(
      'internal',
      err.message || 'Payment failed. Please try again.'
    );
  }
});

/**
 * Charge when a collaborator joins a trip.
 * $1 for individual plans (pay_per_trip, monthly, annual, ltd).
 * For business: first 10 free, then handled by subscription metering.
 * Called from JoinPlan after user joins.
 */
exports.chargeCollaboratorJoin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { planId, planOwnerId, collaboratorName, planName } = data;
  if (!planId || !planOwnerId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing planId or planOwnerId');
  }

  // The joiner is context.auth.uid; the plan owner (who gets charged) is planOwnerId
  const licenseSnap = await admin.firestore().doc(`licenses/${planOwnerId}`).get();
  const license = licenseSnap.data();

  if (!license) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Plan owner has no license'
    );
  }

  const planType = license.plan;

  // Business plans: first 10 free, $2/mo for extras - that's metered, not one-time.
  // For now we charge $1 for individual-style plans. Business overages are monthly.
  if (planType === 'business_monthly' || planType === 'business_annual') {
    // TODO: Implement Stripe metered billing for business overages
    // For now, skip charge - business overages handled by subscription
    return { success: true, charged: false, reason: 'business_plan' };
  }

  // Individual plans: $1 per collaborator join
  const stripeCustomerId = license.stripeCustomerId;
  const paymentMethodId = license.stripePaymentMethodId || license.defaultPaymentMethod;

  if (!stripeCustomerId || !paymentMethodId) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Plan owner has no payment method. They will be notified to add one.'
    );
  }

  if (!stripe) {
    throw new functions.https.HttpsError('failed-precondition', 'Payment system not configured.');
  }

  const amountCents = 100; // $1

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true },
      metadata: {
        type: 'collaborator_join',
        planId,
        planOwnerId,
        collaboratorId: context.auth.uid,
      },
    });

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not completed: ${paymentIntent.status}`);
    }

    await admin.firestore().collection('charges').add({
      planOwnerId,
      planId,
      type: 'collaborator_join',
      amountCents,
      collaboratorId: context.auth.uid,
      collaboratorName: collaboratorName || 'Collaborator',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add notification for plan owner
    await admin.firestore().collection('notifications').add({
      userId: planOwnerId,
      type: 'collaborator_charged',
      message: `${collaboratorName || 'Someone'} has joined ${planName || 'your trip'}! We added $1 for this collaborator.`,
      planId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, charged: true };
  } catch (err) {
    console.error('Stripe collaborator charge error:', err);
    throw new functions.https.HttpsError(
      'internal',
      err.message || 'Charge failed. Please try again.'
    );
  }
});

function getAppBaseUrl() {
  return (
    process.env.APP_BASE_URL ||
    functions.config().app?.url ||
    'http://localhost:5173'
  );
}

function resolveAppBaseUrl(clientBaseUrl) {
  const raw = String(clientBaseUrl || '').trim();
  if (raw) {
    try {
      const parsed = new URL(raw);
      if (parsed.protocol === 'https:' || parsed.hostname === 'localhost') {
        return raw.replace(/\/$/, '');
      }
    } catch {
      // Fall through to server config/default.
    }
  }
  return getAppBaseUrl().replace(/\/$/, '');
}

function normalizeInviteCode(code) {
  return String(code || '').trim().toUpperCase();
}

function isBusinessPlan(plan) {
  return plan === 'business_monthly' || plan === 'business_annual';
}

async function getPlanByInviteCode(inviteCode) {
  const code = normalizeInviteCode(inviteCode);
  const snap = await admin
    .firestore()
    .collection('plans')
    .where('inviteCode', '==', code)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function addCollaboratorToPlan({ plan, collaboratorUid }) {
  await admin.firestore().runTransaction(async (tx) => {
    const planRef = admin.firestore().doc(`plans/${plan.id}`);
    const planSnap = await tx.get(planRef);
    if (!planSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Plan no longer exists.');
    }
    const latest = planSnap.data();
    if (Array.isArray(latest.members) && latest.members.includes(collaboratorUid)) {
      return;
    }
    tx.update(planRef, {
      members: admin.firestore.FieldValue.arrayUnion(collaboratorUid),
      inviteUseCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
}

/**
 * Create a collaborator join request.
 * Individual plans => pending admin payment gate.
 * Business plans => direct join (no immediate charge gate).
 */
exports.createCollaboratorJoinRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const inviteCode = normalizeInviteCode(data?.inviteCode);
  if (!inviteCode) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing inviteCode');
  }

  const collaboratorUid = context.auth.uid;
  const collaboratorEmail = context.auth.token.email || null;
  const plan = await getPlanByInviteCode(inviteCode);
  if (!plan) {
    throw new functions.https.HttpsError('not-found', 'Invalid invite code');
  }

  const collaboratorAlreadyMember = Array.isArray(plan.members) && plan.members.includes(collaboratorUid);
  if (collaboratorAlreadyMember) {
    console.log('createCollaboratorJoinRequest: already-member short-circuit', {
      planId: plan.id,
      collaboratorUid,
      adminUid: plan.admin || plan.createdBy || null,
    });
    return { mode: 'already_member', planId: plan.id };
  }

  if (plan.inviteExpiresAt) {
    const expiresAt = plan.inviteExpiresAt.toDate
      ? plan.inviteExpiresAt.toDate()
      : new Date(plan.inviteExpiresAt);
    if (new Date() > expiresAt) {
      throw new functions.https.HttpsError('failed-precondition', 'This invite has expired.');
    }
  }
  if (plan.inviteMaxUses && plan.inviteMaxUses > 0) {
    if ((plan.inviteUseCount || 0) >= plan.inviteMaxUses) {
      throw new functions.https.HttpsError('failed-precondition', 'This invite has reached max uses.');
    }
  }

  const adminUid = plan.admin || plan.createdBy;
  if (!adminUid) {
    throw new functions.https.HttpsError('failed-precondition', 'Plan admin missing');
  }

  const licSnap = await admin.firestore().doc(`licenses/${adminUid}`).get();
  const lic = licSnap.data() || null;
  const adminPlan = lic?.plan || (lic?.status === 'active' ? 'ltd' : 'free');
  const explicitBusinessPlan = lic?.plan;
  const business = isBusinessPlan(adminPlan);
  console.log('createCollaboratorJoinRequest: plan resolution', {
    planId: plan.id,
    inviteCode,
    adminUid,
    collaboratorUid,
    adminPlan,
    explicitBusinessPlan: explicitBusinessPlan || null,
    business,
  });

  if (business) {
    await addCollaboratorToPlan({ plan, collaboratorUid });
    await admin.firestore().collection('notifications').add({
      userId: adminUid,
      type: 'collaborator_joined_business',
      message: `${collaboratorEmail || 'A collaborator'} joined ${plan.name || 'your plan'}.`,
      planId: plan.id,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { mode: 'joined', planId: plan.id, gateReason: 'business_plan' };
  }

  const existing = await admin
    .firestore()
    .collection('collaboratorJoinRequests')
    .where('planId', '==', plan.id)
    .where('collaboratorUid', '==', collaboratorUid)
    .where('status', '==', 'pending_admin_payment')
    .limit(1)
    .get();
  if (!existing.empty) {
    return {
      mode: 'pending_payment',
      requestId: existing.docs[0].id,
      planId: plan.id,
      adminUid,
      gateReason: 'existing_pending_request',
    };
  }

  const reqRef = admin.firestore().collection('collaboratorJoinRequests').doc();
  await reqRef.set({
    planId: plan.id,
    inviteCode,
    adminUid,
    adminEmail: plan.createdByEmail || null,
    collaboratorUid,
    collaboratorEmail,
    collaboratorName: data?.collaboratorName || null,
    status: 'pending_admin_payment',
    amountCents: 100,
    billingKind: 'individual',
    licensePlan: adminPlan,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await admin.firestore().collection('notifications').add({
    userId: adminUid,
    type: 'collaborator_payment_approval_required',
    message: `${collaboratorEmail || 'A collaborator'} is waiting to join ${plan.name || 'your plan'}.`,
    planId: plan.id,
    requestId: reqRef.id,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    mode: 'pending_payment',
    requestId: reqRef.id,
    planId: plan.id,
    adminUid,
    gateReason: 'individual_or_ltd_plan',
  };
});

/**
 * Admin approves collaborator by launching Stripe Checkout.
 */
exports.createCollaboratorJoinCheckout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  if (!stripe) {
    throw new functions.https.HttpsError('failed-precondition', 'Payment system not configured.');
  }

  const requestId = String(data?.requestId || '').trim();
  if (!requestId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing requestId');
  }

  const requestRef = admin.firestore().doc(`collaboratorJoinRequests/${requestId}`);
  const reqSnap = await requestRef.get();
  if (!reqSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Request not found');
  }
  const request = reqSnap.data();
  if (request.adminUid !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Only plan admin can approve payment');
  }
  if (request.status !== 'pending_admin_payment') {
    throw new functions.https.HttpsError('failed-precondition', 'Request is no longer pending');
  }

  const planSnap = await admin.firestore().doc(`plans/${request.planId}`).get();
  if (!planSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Plan not found');
  }
  const plan = planSnap.data();

  const licSnap = await admin.firestore().doc(`licenses/${request.adminUid}`).get();
  const lic = licSnap.data() || {};
  const planType = lic.plan || (lic.status === 'active' ? 'ltd' : 'free');
  if (isBusinessPlan(planType)) {
    throw new functions.https.HttpsError('failed-precondition', 'Business plans do not require immediate collaborator checkout');
  }
  if (!lic.plan && lic.status !== 'active') {
    throw new functions.https.HttpsError('failed-precondition', 'Admin must purchase a paid plan before approving collaborators.');
  }

  const appBase = resolveAppBaseUrl(data?.appBaseUrl);
  const successUrl = `${appBase}/invite-payment/success?requestId=${encodeURIComponent(requestId)}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appBase}/plan/${request.planId}`;
  const amountCents = Number(request.amountCents || 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: lic.stripeCustomerId || undefined,
    customer_email: context.auth.token.email || undefined,
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: {
            name: 'Collaborator approval',
            description: `${request.collaboratorEmail || 'Collaborator'} joining ${plan.name || 'your plan'}`,
          },
        },
      },
    ],
    metadata: {
      type: 'collaborator_join_request',
      requestId,
      planId: request.planId,
      adminUid: request.adminUid,
      collaboratorUid: request.collaboratorUid,
    },
  });

  await requestRef.set(
    {
      stripeCheckoutSessionId: session.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { success: true, url: session.url, sessionId: session.id };
});

/**
 * Finalize collaborator join after admin pays in Checkout.
 */
exports.finalizeCollaboratorJoinAfterCheckout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  if (!stripe) {
    throw new functions.https.HttpsError('failed-precondition', 'Payment system not configured.');
  }

  const requestId = String(data?.requestId || '').trim();
  const sessionId = String(data?.sessionId || '').trim();
  if (!requestId || !sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing requestId or sessionId');
  }

  const requestRef = admin.firestore().doc(`collaboratorJoinRequests/${requestId}`);
  const reqSnap = await requestRef.get();
  if (!reqSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Request not found');
  }
  const request = reqSnap.data();
  const caller = context.auth.uid;
  if (caller !== request.adminUid && caller !== request.collaboratorUid) {
    throw new functions.https.HttpsError('permission-denied', 'Not allowed');
  }
  if (request.status === 'paid') {
    return { success: true, status: 'paid', planId: request.planId };
  }
  if (request.status !== 'pending_admin_payment') {
    throw new functions.https.HttpsError('failed-precondition', `Request status is ${request.status}`);
  }
  if (request.stripeCheckoutSessionId && request.stripeCheckoutSessionId !== sessionId) {
    throw new functions.https.HttpsError('failed-precondition', 'Session mismatch');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== 'paid') {
    throw new functions.https.HttpsError('failed-precondition', 'Payment has not completed yet');
  }

  const planRef = admin.firestore().doc(`plans/${request.planId}`);
  await admin.firestore().runTransaction(async (tx) => {
    const reqFresh = await tx.get(requestRef);
    if (!reqFresh.exists) {
      throw new functions.https.HttpsError('not-found', 'Request not found');
    }
    const reqData = reqFresh.data();
    if (reqData.status === 'paid') return;
    if (reqData.status !== 'pending_admin_payment') {
      throw new functions.https.HttpsError('failed-precondition', 'Request no longer pending');
    }

    const planSnap = await tx.get(planRef);
    if (!planSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Plan not found');
    }
    const planData = planSnap.data();

    if (!Array.isArray(planData.members) || !planData.members.includes(reqData.collaboratorUid)) {
      tx.update(planRef, {
        members: admin.firestore.FieldValue.arrayUnion(reqData.collaboratorUid),
        inviteUseCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    tx.update(requestRef, {
      status: 'paid',
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      stripeCheckoutSessionId: sessionId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await admin.firestore().collection('charges').add({
    planOwnerId: request.adminUid,
    planId: request.planId,
    type: 'collaborator_join_checkout',
    amountCents: Number(request.amountCents || 100),
    collaboratorId: request.collaboratorUid,
    collaboratorName: request.collaboratorName || request.collaboratorEmail || 'Collaborator',
    stripeCheckoutSessionId: sessionId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await admin.firestore().collection('notifications').add({
    userId: request.collaboratorUid,
    type: 'collaborator_join_approved',
    message: 'Your join request was approved and paid by the plan admin.',
    planId: request.planId,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, status: 'paid', planId: request.planId };
});

exports.rejectCollaboratorJoinRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  const requestId = String(data?.requestId || '').trim();
  if (!requestId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing requestId');
  }

  const requestRef = admin.firestore().doc(`collaboratorJoinRequests/${requestId}`);
  const reqSnap = await requestRef.get();
  if (!reqSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Request not found');
  }
  const request = reqSnap.data();
  if (request.adminUid !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Only plan admin can reject');
  }
  if (request.status !== 'pending_admin_payment') {
    return { success: true, status: request.status };
  }

  await requestRef.update({
    status: 'rejected',
    rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await admin.firestore().collection('notifications').add({
    userId: request.collaboratorUid,
    type: 'collaborator_join_rejected',
    message: 'Your collaborator join request was declined by the plan admin.',
    planId: request.planId,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, status: 'rejected' };
});

/**
 * Save Stripe Customer and PaymentMethod to user's license (pay-per-trip).
 * Called after Stripe SetupIntent succeeds on frontend.
 */
exports.savePaymentMethod = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { stripeCustomerId, paymentMethodId } = data;
  if (!stripeCustomerId || !paymentMethodId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing Stripe IDs');
  }

  const userId = context.auth.uid;

  await admin.firestore().doc(`licenses/${userId}`).set(
    {
      stripeCustomerId,
      stripePaymentMethodId: paymentMethodId,
      plan: 'pay_per_trip',
      status: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { success: true };
});

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

function resolveLicensePlan(lic) {
  if (!lic) return 'free';
  return lic.plan || (lic.status === 'active' ? 'ltd' : 'free');
}

function collaboratorCountExcludingAdmin(plan, adminUid) {
  const members = plan.members || [];
  return members.filter((uid) => uid !== adminUid).length;
}

function preTripAmountCents(licensePlan, collaboratorCount) {
  if (licensePlan === 'pay_per_trip') {
    return (2 + collaboratorCount) * 100;
  }
  if (
    licensePlan === 'individual_monthly' ||
    licensePlan === 'individual_annual' ||
    licensePlan === 'ltd'
  ) {
    return collaboratorCount * 100;
  }
  return 0;
}

/**
 * Scheduled: charge trip + collaborator usage for plans whose billing window has opened
 * (48 hours before trip start). Replaces same-day confirmation and per-join charges for individuals.
 */
exports.processPreTripCharges = functions.pubsub.schedule('every 15 minutes').onRun(async () => {
  if (!stripe) {
    console.warn('processPreTripCharges: Stripe not configured');
    return null;
  }

  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  let snap;
  try {
    snap = await db
      .collection('plans')
      .where('preTripChargeStatus', '==', 'pending')
      .where('preTripChargeAt', '<=', now)
      .limit(25)
      .get();
  } catch (e) {
    console.error('processPreTripCharges query failed', e);
    return null;
  }

  for (const docSnap of snap.docs) {
    const planRef = docSnap.ref;
    const plan = docSnap.data();

    try {
      if (plan.preTripChargeStatus !== 'pending') continue;

      const adminUid = plan.admin || plan.createdBy;
      if (!adminUid) {
        await planRef.update({
          preTripChargeStatus: 'failed',
          preTripChargeError: 'no_admin',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        continue;
      }

      const licSnap = await db.doc(`licenses/${adminUid}`).get();
      const lic = licSnap.data() || {};
      const licensePlan = resolveLicensePlan(lic);

      if (licensePlan === 'business_monthly' || licensePlan === 'business_annual') {
        await planRef.update({
          preTripChargeStatus: 'not_applicable',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        continue;
      }

      const collabCount = collaboratorCountExcludingAdmin(plan, adminUid);
      const amountCents = preTripAmountCents(licensePlan, collabCount);

      if (amountCents <= 0) {
        await planRef.update({
          preTripChargeStatus: 'charged',
          preTripChargeAmountCents: 0,
          preTripChargeCollaboratorCount: collabCount,
          preTripChargeCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        continue;
      }

      const stripeCustomerId = lic.stripeCustomerId;
      const paymentMethodId = lic.stripePaymentMethodId || lic.defaultPaymentMethod;
      if (!stripeCustomerId || !paymentMethodId) {
        await planRef.update({
          preTripChargeStatus: 'failed',
          preTripChargeError: 'no_payment_method',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        await db.collection('notifications').add({
          userId: adminUid,
          type: 'pre_trip_charge_failed',
          message: `Add a payment method to complete billing for "${plan.name || 'your trip'}" before it starts.`,
          planId: planRef.id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        continue;
      }

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountCents,
          currency: 'usd',
          customer: stripeCustomerId,
          payment_method: paymentMethodId,
          confirm: true,
          automatic_payment_methods: { enabled: true },
          metadata: {
            type: 'pre_trip_charge',
            planId: planRef.id,
            adminUid,
          },
        },
        { idempotencyKey: `pre_trip_${planRef.id}` }
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not completed: ${paymentIntent.status}`);
      }

      await planRef.update({
        preTripChargeStatus: 'charged',
        preTripChargeAmountCents: amountCents,
        preTripChargeCollaboratorCount: collabCount,
        preTripChargeStripePaymentIntentId: paymentIntent.id,
        preTripChargeCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('charges').add({
        userId: adminUid,
        planId: planRef.id,
        type: 'pre_trip_charge',
        amountCents,
        collaboratorCount: collabCount,
        licensePlan,
        stripePaymentIntentId: paymentIntent.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error('processPreTripCharges plan error', planRef.id, err);
    }
  }

  return null;
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
  const logEntry = {
    uid: collaboratorUid,
    joinedAt: admin.firestore.Timestamp.now(),
  };
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
      collaboratorJoinLog: admin.firestore.FieldValue.arrayUnion(logEntry),
      inviteUseCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
}

/**
 * Complete invite join: add collaborator, append to collaboratorJoinLog.
 * Per-collaborator and trip usage billing runs in processPreTripCharges (48h before trip).
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

  await addCollaboratorToPlan({ plan, collaboratorUid });
  await admin.firestore().collection('notifications').add({
    userId: adminUid,
    type: business ? 'collaborator_joined_business' : 'collaborator_joined',
    message: `${collaboratorEmail || 'A collaborator'} joined ${plan.name || 'your plan'}.`,
    planId: plan.id,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return {
    mode: 'joined',
    planId: plan.id,
    gateReason: business ? 'business_plan' : 'deferred_pre_trip_billing',
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
      const logEntry = {
        uid: reqData.collaboratorUid,
        joinedAt: admin.firestore.Timestamp.now(),
      };
      tx.update(planRef, {
        members: admin.firestore.FieldValue.arrayUnion(reqData.collaboratorUid),
        collaboratorJoinLog: admin.firestore.FieldValue.arrayUnion(logEntry),
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

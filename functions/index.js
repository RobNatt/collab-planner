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

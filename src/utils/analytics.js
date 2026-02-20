// Google Analytics 4 — event tracking helpers
// Replace G-XXXXXXX with your Measurement ID everywhere it appears.
// Get it from: GA4 > Admin > Data Streams > your web stream > Measurement ID

/**
 * Core dispatcher. All other helpers call this.
 * Silently no-ops if gtag hasn't loaded yet (e.g. during local dev without GA).
 */
export function trackEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

// ─── Acquisition ────────────────────────────────────────────────────────────

/**
 * Fire after Firebase createUserWithEmailAndPassword succeeds.
 * Mark as conversion in GA4 → tracks new user acquisition.
 */
export function trackSignupComplete(method = 'email') {
  trackEvent('signup_complete', { method });
}

// ─── Activation ─────────────────────────────────────────────────────────────

/**
 * Fire after addDoc(collection(db, 'plans'), ...) resolves in CreatePlan.
 * Mark as conversion → shows users who reached their "aha moment".
 */
export function trackTripCreated(planName, durationDays) {
  trackEvent('trip_created', {
    plan_name: planName,
    duration_days: durationDays,
  });
}

/**
 * Fire after generateInviteCode() succeeds in InviteSection.
 * Indicates a trip is being actively shared — high-intent engagement signal.
 */
export function trackCollaboratorInvited(planId, expirationMs, maxUses) {
  trackEvent('collaborator_invited', {
    plan_id: planId,
    expiration_hours: expirationMs > 0 ? Math.round(expirationMs / (60 * 60 * 1000)) : 'never',
    max_uses: maxUses === 0 ? 'unlimited' : maxUses,
  });
}

// ─── Revenue ─────────────────────────────────────────────────────────────────

/**
 * Fire just before window.location.href = stripeUrl in Pricing.handleCheckout.
 * Mark as conversion → measures checkout intent, not just visits to /pricing.
 */
export function trackCheckoutStarted() {
  trackEvent('checkout_started', {
    currency: 'USD',
    value: 49,
    item_name: 'Collab Planner Lifetime Deal',
  });
}

/**
 * Fire after setDoc(licenses/uid) resolves in PurchaseSuccess.
 * Uses GA4's reserved 'purchase' event so revenue shows in Monetization reports.
 * Mark as conversion → your primary revenue KPI.
 *
 * NOTE: transactionId here is the Firebase UID — replace with the Stripe
 * Payment Intent ID if you later expose it via a success URL param or webhook.
 */
export function trackPurchaseComplete(userId) {
  trackEvent('purchase', {
    transaction_id: userId,
    currency: 'USD',
    value: 49,
    items: [
      {
        item_id: 'collab_planner_ltd',
        item_name: 'Collab Planner Lifetime Deal',
        price: 49,
        quantity: 1,
      },
    ],
  });
}

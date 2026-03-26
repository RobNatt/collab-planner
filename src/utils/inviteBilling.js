import { PLAN_TYPES } from '../data/pricingPlans';

/** @typedef {'individual' | 'business' | 'free'} BillingKind */

/**
 * Map license.plan (or null) to a coarse billing bucket for invite copy.
 * @param {string | null | undefined} licensePlan
 * @returns {BillingKind}
 */
export function billingKindFromLicensePlan(licensePlan) {
  if (!licensePlan || licensePlan === PLAN_TYPES.FREE) return 'free';
  if (licensePlan === PLAN_TYPES.BUSINESS_MONTHLY || licensePlan === PLAN_TYPES.BUSINESS_ANNUAL) {
    return 'business';
  }
  return 'individual';
}

/**
 * Short label for the invite landing page.
 * @param {BillingKind} kind
 */
export function collaboratorChargeSummary(kind) {
  if (kind === 'business') {
    return 'This organizer uses a Business plan: the first 10 collaborators are included. Additional roster spots may add about $2/month for the organizer (not charged to you).';
  }
  if (kind === 'individual') {
    return 'Their plan typically includes a $1 collaborator fee when you join (charged to the organizer, not to your card).';
  }
  return 'No collaborator fee applies until the organizer adds a paid plan and payment method.';
}

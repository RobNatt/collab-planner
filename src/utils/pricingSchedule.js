import { Timestamp } from 'firebase/firestore';
import { PLAN_TYPES } from '../data/pricingPlans';

export const PRE_TRIP_CHARGE_HOURS = 48;

const BILLABLE_LICENSES = new Set([
  PLAN_TYPES.PAY_PER_TRIP,
  PLAN_TYPES.INDIVIDUAL_MONTHLY,
  PLAN_TYPES.INDIVIDUAL_ANNUAL,
  PLAN_TYPES.LTD,
]);

/**
 * When usage-based billing runs: trip start minus 48 hours (UTC noon on start date as anchor).
 * @param {string} startDate YYYY-MM-DD
 * @returns {import('firebase/firestore').Timestamp | null}
 */
export function getPreTripChargeAt(startDate) {
  if (!startDate || typeof startDate !== 'string') return null;
  const d = new Date(`${startDate.trim()}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - PRE_TRIP_CHARGE_HOURS * 60 * 60 * 1000;
  return Timestamp.fromMillis(ms);
}

/**
 * @param {string | null | undefined} planType
 * @param {boolean} isBusiness
 * @returns {'pending' | 'not_applicable'}
 */
export function getPreTripChargeStatus(planType, isBusiness) {
  if (isBusiness) return 'not_applicable';
  if (planType && BILLABLE_LICENSES.has(planType)) return 'pending';
  return 'not_applicable';
}

/**
 * Firestore fields for a new plan document.
 * @param {{ planType: string | null | undefined, isBusiness: boolean, startDate: string }} opts
 */
export function getPreTripChargeFields({ planType, isBusiness, startDate }) {
  const preTripChargeStatus = getPreTripChargeStatus(planType, isBusiness);
  const preTripChargeAt =
    preTripChargeStatus === 'pending' ? getPreTripChargeAt(startDate) : null;
  return {
    preTripChargeStatus,
    preTripChargeAt,
    preTripChargeWindowHours: PRE_TRIP_CHARGE_HOURS,
    collaboratorJoinLog: [],
  };
}

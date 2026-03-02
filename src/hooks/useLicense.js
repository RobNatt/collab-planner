import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PLAN_TYPES } from '../data/pricingPlans';

/**
 * Plan types that grant "unlimited" access (no 4-day limit, no member caps for trip creation).
 */
const UNLIMITED_PLANS = new Set([
  PLAN_TYPES.LTD,
  PLAN_TYPES.PAY_PER_TRIP,
  PLAN_TYPES.INDIVIDUAL_MONTHLY,
  PLAN_TYPES.INDIVIDUAL_ANNUAL,
  PLAN_TYPES.BUSINESS_MONTHLY,
  PLAN_TYPES.BUSINESS_ANNUAL,
]);

/**
 * Plan types that are business (have roster, first 10 free, $2/mo for extras).
 */
const BUSINESS_PLAN_TYPES = new Set([
  PLAN_TYPES.BUSINESS_MONTHLY,
  PLAN_TYPES.BUSINESS_ANNUAL,
]);

export function useLicense(userId) {
  const [isLTD, setIsLTD] = useState(false);
  const [loading, setLoading] = useState(true);
  const [license, setLicense] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkLicense = async () => {
      try {
        const licenseDoc = await getDoc(doc(db, 'licenses', userId));
        if (licenseDoc.exists()) {
          const data = licenseDoc.data();
          setLicense(data);
          // Legacy: status === 'active' meant LTD. New: check plan type.
          const plan = data.plan || (data.status === 'active' ? 'ltd' : null);
          setIsLTD(plan === PLAN_TYPES.LTD || (data.status === 'active' && !plan));
        } else {
          setIsLTD(false);
          setLicense(null);
        }
      } catch {
        setIsLTD(false);
        setLicense(null);
      }
      setLoading(false);
    };

    checkLicense();
  }, [userId]);

  const planType = license?.plan || (license?.status === 'active' ? PLAN_TYPES.LTD : null);
  const hasUnlimitedAccess = planType && UNLIMITED_PLANS.has(planType);
  const isBusiness = planType && BUSINESS_PLAN_TYPES.has(planType);

  return {
    isLTD,
    loading,
    license,
    planType,
    hasUnlimitedAccess,
    isBusiness,
  };
}

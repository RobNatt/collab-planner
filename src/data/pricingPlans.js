/**
 * Pricing plan definitions for Individual and Business tiers.
 * Used by Landing page pricing table and plan selection flows.
 */

export const INDIVIDUAL_PLANS = [
  {
    id: 'pay_per_trip',
    name: 'Pay Per Trip',
    price: '$2',
    priceNote: '/trip + $1/collaborator',
    monthlyEquivalent: null,
    description: 'Sign up free. Pay when you confirm a trip. $2 per trip + $1 when each collaborator joins.',
    features: [
      'Sign up free, no subscription',
      '$2 per trip at confirmation',
      '$1 per collaborator when they join (link or QR)',
      'Unlimited trip duration',
      'All features included',
    ],
    cta: 'Get Started',
    ctaNote: 'Add payment method when you create your first trip',
    stripePriceId: null, // Set via env: pay-per-trip uses SetupIntent + Payment Intents
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$10',
    priceNote: '/month',
    monthlyEquivalent: 10,
    description: 'Unlimited plans. $1 per collaborator when they create a profile and join a trip.',
    savings: null,
    features: [
      'Unlimited trip plans',
      '$1 per collaborator when they join a trip',
      'Unlimited trip duration',
      'All features included',
    ],
    cta: 'Subscribe Monthly',
    stripeEnvKey: 'VITE_STRIPE_INDIVIDUAL_MONTHLY_LINK',
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$100',
    priceNote: '/year',
    monthlyEquivalent: 8.33,
    description: '2 months free. $1 per collaborator when they create a profile and join a trip.',
    savings: '2 months free',
    features: [
      'Unlimited trip plans',
      '$1 per collaborator when they join a trip',
      'Unlimited trip duration',
      'All features included',
    ],
    cta: 'Subscribe Annually',
    stripeEnvKey: 'VITE_STRIPE_INDIVIDUAL_ANNUAL_LINK',
  },
];

export const BUSINESS_PLANS = [
  {
    id: 'business_monthly',
    name: 'Business Monthly',
    price: '$50',
    priceNote: '/month',
    monthlyEquivalent: 50,
    description: 'First 10 collaborators free. $2/month for each additional collaborator on your roster.',
    savings: null,
    features: [
      'Unlimited trip plans',
      'First 10 collaborators free',
      '$2/month per collaborator over 10 (roster)',
      'Collaborator roster saved in dashboard',
      'Add/remove collaborators from trips',
      'Unlimited trip duration',
      'All features included',
    ],
    cta: 'Subscribe Monthly',
    stripeEnvKey: 'VITE_STRIPE_BUSINESS_MONTHLY_LINK',
  },
  {
    id: 'business_annual',
    name: 'Business Annual',
    price: '$500',
    priceNote: '/year',
    monthlyEquivalent: 41.67,
    description: '2 months free. First 10 collaborators free. $2/month for each additional.',
    savings: '2 months free',
    features: [
      'Unlimited trip plans',
      'First 10 collaborators free',
      '$2/month per collaborator over 10 (roster)',
      'Collaborator roster saved in dashboard',
      'Add/remove collaborators from trips',
      'Unlimited trip duration',
      'All features included',
    ],
    cta: 'Subscribe Annually',
    stripeEnvKey: 'VITE_STRIPE_BUSINESS_ANNUAL_LINK',
  },
];

export const PLAN_TYPES = {
  FREE: 'free',
  PAY_PER_TRIP: 'pay_per_trip',
  INDIVIDUAL_MONTHLY: 'individual_monthly',
  INDIVIDUAL_ANNUAL: 'individual_annual',
  BUSINESS_MONTHLY: 'business_monthly',
  BUSINESS_ANNUAL: 'business_annual',
  LTD: 'ltd',
};

export const FEATURE_ROW_LABELS = [
  'Plans',
  'Collaborator pricing',
  'Trip duration',
  'Roster / saved profiles',
  'Billing',
];

/**
 * Pricing plan definitions for Individual and Business tiers.
 * Used by Landing page pricing table and plan selection flows.
 */

export const INDIVIDUAL_PLANS = [
  {
    id: 'pay_per_trip',
    slug: 'pay-per-trip',
    name: 'Pay Per Trip',
    price: '$2',
    priceNote: '/trip + $1/collaborator',
    monthlyEquivalent: null,
    description:
      'Sign up free. Collaborators can join anytime; trip and collaborator usage are billed together 48 hours before your trip starts.',
    features: [
      'Sign up free, no subscription',
      '$2 per trip + $1 per collaborator, charged 48h before trip start',
      'Invite collaborators early — no charge until the pre-trip billing window',
      'Unlimited trip duration',
      'All features included',
    ],
    benefits: [
      'Try the full product with your group before any usage-based charge hits your card.',
      'No trip fee or collaborator fees at signup — billing runs once, 48 hours before the trip begins.',
      'Predictable math: $2 for the trip plus $1 for each collaborator on the plan at billing time (organizer excluded).',
      'Unlimited trip length and every planning feature, same as subscribers.',
    ],
    cta: 'Get Started',
    ctaNote: 'Add a payment method before the pre-trip billing window',
    stripePriceId: null, // Set via env: pay-per-trip uses SetupIntent + Payment Intents
  },
  {
    id: 'monthly',
    slug: 'monthly',
    name: 'Monthly',
    price: '$10',
    priceNote: '/month',
    monthlyEquivalent: 10,
    trialLabel: 'Free 2 week trial',
    description:
      'Unlimited plans for one predictable subscription. Collaborator usage is billed 48 hours before each trip.',
    features: [
      'Free 2 week trial',
      'Unlimited trip plans',
      '$10/month subscription',
      '$1 per collaborator per trip, charged 48h before trip start',
      'Unlimited trip duration',
      'All features included',
    ],
    benefits: [
      'Free 2 week trial — add a card at signup; subscription billing starts after the trial unless you cancel.',
      'Best when you plan several group trips per year and want a simple monthly subscription.',
      'Collaborators can join and explore the plan early; per-collaborator charges align with the trip date, not the invite.',
      'Unlimited itineraries, tasks, and collaboration features on every plan.',
    ],
    savings: null,
    cta: 'Subscribe Monthly',
    stripeEnvKey: 'VITE_STRIPE_INDIVIDUAL_MONTHLY_LINK',
  },
  {
    id: 'annual',
    slug: 'annual',
    name: 'Annual',
    price: '$100',
    priceNote: '/year',
    monthlyEquivalent: 8.33,
    trialLabel: 'Free 2 week trial',
    description:
      'Two months free vs monthly. Collaborator usage is billed 48 hours before each trip.',
    features: [
      'Free 2 week trial',
      'Unlimited trip plans',
      '$100/year (2 months free vs monthly)',
      '$1 per collaborator per trip, charged 48h before trip start',
      'Unlimited trip duration',
      'All features included',
    ],
    benefits: [
      'Free 2 week trial — add a card at signup; subscription billing starts after the trial unless you cancel.',
      'Lowest subscription cost for individuals who plan trips all year.',
      'Same collaborator billing model as monthly: try people on the plan, pay for who is on the roster at the pre-trip window.',
      'Unlimited plans and full feature access.',
    ],
    savings: '2 months free',
    cta: 'Subscribe Annually',
    stripeEnvKey: 'VITE_STRIPE_INDIVIDUAL_ANNUAL_LINK',
  },
];

export const BUSINESS_PLANS = [
  {
    id: 'business_monthly',
    slug: 'business-monthly',
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
    benefits: [
      'Built for teams and agencies that run many client or staff trips.',
      'Roster-based pricing: the first ten people are included; expand the roster as you grow.',
      'We still record everyone who joins each plan for your dashboard and transparency.',
    ],
    cta: 'Subscribe Monthly',
    stripeEnvKey: 'VITE_STRIPE_BUSINESS_MONTHLY_LINK',
  },
  {
    id: 'business_annual',
    slug: 'business-annual',
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
    benefits: [
      'Same Business features as monthly with two months free on the subscription.',
      'Predictable annual cost for organizations standardizing on Collab Planner.',
      'Roster and trip activity stay visible in one place.',
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

/** All public marketing plans (individual + business) for detail pages and lookups. */
export const ALL_MARKETING_PLANS = [...INDIVIDUAL_PLANS, ...BUSINESS_PLANS];

/**
 * @param {string} slug
 * @returns {typeof INDIVIDUAL_PLANS[0] | undefined}
 */
export function getMarketingPlanBySlug(slug) {
  return ALL_MARKETING_PLANS.find((p) => p.slug === slug);
}

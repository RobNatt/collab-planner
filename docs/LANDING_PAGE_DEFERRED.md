# Main / landing page — deferred changes

**Update:** The home page was **replaced** with the LTD-focused marketing funnel (`src/pages/Landing.jsx`). The notes below apply to **future** hero/pricing experiments, not the current shipped page.

**Earlier status (archived):** The home page was intentionally unchanged for a period; that decision is superseded by the funnel launch.

## Where it lives

| What | Location |
|------|----------|
| Main page UI and sections | `src/pages/Landing.jsx` |
| Pricing table copy & plan metadata | `src/data/pricingPlans.js` |
| Plan detail pages (linked from pricing) | `src/pages/PlanPage.jsx`, routes `/plans/:planSlug` |

## When you pick this up again

- Revisit headline, subcopy, feature grid, social proof, and primary CTAs on `Landing.jsx`.
- Align pricing section with any new Stripe offers or trials (`pricingPlans.js`).
- SEO shell: `index.html` (title, meta, OG) if positioning shifts.

This file is only a **parking lot** for the decision; it does not block other routes or components.

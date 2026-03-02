# Pricing Updates Changelog

Summary of pricing and Stripe-related changes.

---

## New Plans Structure

### Individual Plans
- **Pay Per Trip** — Sign up free, $2/trip at confirmation + $1 per collaborator when they join
- **Monthly** — $10/month, unlimited plans, $1 per collaborator when they join a trip
- **Annual** — $100/year (2 months free), $1 per collaborator when they join a trip

### Business Plans
- **Business Monthly** — $50/month, first 10 collaborators free, $2/month each after
- **Business Annual** — $500/year (2 months free), first 10 collaborators free, $2/month each after
- Collaborator roster saved in dashboard; add/remove from trips

### Lifetime Deal (LTD)
- **$49** one-time — $1 per collaborator on all future trips, unlimited features
- Hidden/special offer at `/ltd`

---

## Files Changed

### New Files
- `src/pages/LTD.jsx` — LTD offer page with congratulations messaging
- `src/components/ConfirmTripModal.jsx` — Trip confirmation modal for pay-per-trip
- `src/data/pricingPlans.js` — Plan definitions (Individual & Business)
- `functions/index.js` — Cloud Functions: chargeTripConfirmation, chargeCollaboratorJoin, savePaymentMethod
- `functions/package.json` — Functions dependencies
- `STRIPE_SETUP.md` — Setup instructions for Stripe & Firebase

### Modified Files
- `src/pages/Landing.jsx` — Individual/Business toggle, pricing table
- `src/pages/Pricing.jsx` — Redirects to `/#pricing`
- `src/pages/Dashboard.jsx` — Upgrade banner links to plans
- `src/App.jsx` — Added `/ltd` route
- `src/hooks/useLicense.js` — New plan types, hasUnlimitedAccess, isBusiness
- `src/components/CreatePlan.jsx` — Pay-per-trip confirmation flow
- `src/components/UpgradeModal.jsx` — Links to `/ltd`
- `src/pages/JoinPlan.jsx` — Calls chargeCollaboratorJoin on join
- `src/config/firebase.js` — Added getFunctions
- `firebase.json` — Added functions config
- `.env.example` — New Stripe env vars
- `public/sitemap.xml` — Added `/ltd`

---

## User To-Do (After Deploy)

1. **Stripe Dashboard** — Create Payment Links for each plan
2. **Environment Variables** — Add `VITE_STRIPE_*_LINK` for each plan
3. **Firebase Functions** — `firebase functions:config:set stripe.secret="sk_..."` then deploy
4. **Payment Method UI** — Add card collection for pay-per-trip users (see STRIPE_SETUP.md)

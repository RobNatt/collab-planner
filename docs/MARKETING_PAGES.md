# Marketing & landing copy — file map

Use this guide to find where public-facing and ad-related copy lives so you can update landing pages, pricing, and funnel messaging without hunting the repo.

Paths are relative to the project root unless noted.

---

## Routes → React pages

| URL path | Page component | Source file |
|----------|----------------|-------------|
| `/` | Landing (home) | `src/pages/Landing.jsx` |
| `/#pricing` | Same as `/`; pricing section id | Scroll target inside `Landing.jsx` (`id="pricing"`) |
| `/pricing` | Redirect | `src/pages/Pricing.jsx` → client redirect to `/#pricing` |
| `/plans/:planSlug` | Per-plan marketing detail | `src/pages/PlanPage.jsx` |
| `/ltd` | Lifetime deal | `src/pages/LTD.jsx` |
| `/demo` | Demo / sample trip | `src/pages/DemoTrip.jsx` |
| `/login` | Auth | `src/pages/Login.jsx` |
| `/welcome` | Post-signup onboarding | `src/pages/Welcome.jsx` |
| `/invite/:inviteCode` | Pre-login invite explainer | `src/pages/InviteLanding.jsx` |
| `/join/:inviteCode` | Logged-in join confirmation | `src/pages/JoinPlan.jsx` |
| `/join/wait/:requestId` | Legacy join wait (older flows) | `src/pages/JoinWait.jsx` |
| `/invite-payment/success` | After invite checkout | `src/pages/InvitePaymentSuccess.jsx` |
| `/purchase-success` | After Stripe purchase | `src/pages/PurchaseSuccess.jsx` |
| `/feedback` | Feedback form | `src/pages/Feedback.jsx` |
| `/terms` | Terms of Service | `src/pages/Terms.jsx` |
| `/privacy` | Privacy Policy | `src/pages/Privacy.jsx` |
| `/blog` | Blog index | `src/pages/Blog.jsx` |
| `/blog/:slug` | Single post | `src/pages/BlogPost.jsx` + `src/data/blogPosts.js` |
| `/affiliates` | Affiliate program | `src/pages/Affiliates.jsx` |
| `/affiliate-dashboard` | Affiliate dashboard | `src/pages/AffiliateDashboard.jsx` |

**Router registration:** all routes are declared in `src/App.jsx`.

---

## Shared copy & data (edit once, reuse everywhere)

| What | File |
|------|------|
| Individual & Business plan names, prices, feature bullets, **benefits** (plan detail pages), slugs, CTAs | `src/data/pricingPlans.js` |
| Plan detail URLs | `/plans/{slug}` — slugs: `pay-per-trip`, `monthly`, `annual`, `business-monthly`, `business-annual` (see `slug` on each plan in `pricingPlans.js`) |
| Invite / billing one-liners for collaborators | `src/utils/inviteBilling.js` |
| Blog posts (title, excerpt, body markdown-ish, SEO) | `src/data/blogPosts.js` |

`PlanPage.jsx` reads plan content via `getMarketingPlanBySlug()` from `pricingPlans.js`.

---

## Site-wide SEO & HTML shell

| What | File |
|------|------|
| Default `<title>`, meta description, keywords, canonical, Open Graph, Twitter | `index.html` |
| Public sitemap URLs | `public/sitemap.xml` |

Update `index.html` when you change the global positioning line for ads or search snippets.

---

## Product UI (not “landing” but often mentioned in ads)

| URL | File | Notes |
|-----|------|--------|
| `/dashboard` | `src/pages/Dashboard.jsx` | Logged-in home |
| `/profile` | `src/pages/Profile.jsx` | Billing / account copy |
| `/plan/:planId` | `src/pages/PlanDetails.jsx` | Inside a trip |

---

## Components that inject copy into flows

| Area | File |
|------|------|
| Create trip + pay-per-trip confirm modal | `src/components/CreatePlan.jsx`, `src/components/ConfirmTripModal.jsx` |
| Upgrade prompts | `src/components/UpgradeModal.jsx` |
| Invite QR / links (admin side) | `src/components/InviteSection.jsx` |

---

## Quick checklist when refreshing ad copy

1. **Home value prop & pricing table:** `src/pages/Landing.jsx`
2. **Plan-specific long pages:** `src/data/pricingPlans.js` (`benefits`, `features`, `description`) + optional tweaks in `src/pages/PlanPage.jsx` (layout only; copy usually stays in data)
3. **LTD offer:** `src/pages/LTD.jsx`
4. **Legal / compliance:** `src/pages/Terms.jsx`, `src/pages/Privacy.jsx`
5. **Invite funnel:** `src/pages/InviteLanding.jsx`, `src/pages/JoinPlan.jsx`, `src/utils/inviteBilling.js`
6. **Search & social defaults:** `index.html`
7. **Blog:** `src/data/blogPosts.js`, `src/pages/Blog.jsx` (index chrome)

---

## Changelog-style docs (optional reference)

Older pricing notes may also appear in `PRICING_UPDATES_CHANGELOG.md` and `STRIPE_SETUP.md`; the **source of truth** for customer-facing plan text is `src/data/pricingPlans.js` plus the pages above.

# Stripe & Firebase Setup for Collab Planner

This guide covers what you need to create and configure for the new pricing plans and billing flows.

---

## 1. Stripe Dashboard Setup

### Products & Prices to Create

Log into [Stripe Dashboard](https://dashboard.stripe.com) → Products.

| Product | Price | Type | Notes |
|--------|-------|------|-------|
| **Lifetime Deal (LTD)** | $49 one-time | One-time Payment Link | Use `client_reference_id` for Firebase UID |
| **Individual Monthly** | $10/month | Subscription | Recurring |
| **Individual Annual** | $100/year | Subscription | Recurring |
| **Business Monthly** | $50/month | Subscription | Recurring, first 10 collaborators free |
| **Business Annual** | $500/year | Subscription | Recurring, first 10 collaborators free |

### Payment Links

1. Create a **Payment Link** for each product above.
2. For LTD: Set success URL to `https://your-domain.com/purchase-success` (or your production URL).
3. For subscriptions: Set success URL and cancel URL as needed.
4. Copy each Payment Link URL (e.g. `https://buy.stripe.com/xxx`).

---

## 2. Environment Variables

### Frontend (`.env` or Vercel env vars)

Add to your `.env`:

```
# Existing
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Stripe Payment Links (one per plan)
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...          # LTD $49
VITE_STRIPE_INDIVIDUAL_MONTHLY_LINK=https://buy.stripe.com/...
VITE_STRIPE_INDIVIDUAL_ANNUAL_LINK=https://buy.stripe.com/...
VITE_STRIPE_BUSINESS_MONTHLY_LINK=https://buy.stripe.com/...
VITE_STRIPE_BUSINESS_ANNUAL_LINK=https://buy.stripe.com/...
```

### Firebase Functions (Stripe Secret)

1. Get your Stripe **Secret Key** from Stripe Dashboard → Developers → API keys.
2. Set it in Firebase:

```bash
firebase functions:config:set stripe.secret="sk_live_..."
```

To use test mode first:

```bash
firebase functions:config:set stripe.secret="sk_test_..."
```

---

## 3. Firebase Cloud Functions

### Deploy Functions

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Deploy:
   ```bash
   firebase deploy --only functions
   ```

3. Ensure your Firebase project is on the **Blaze** plan (pay-as-you-go) to run Cloud Functions.

### Functions Deployed

| Function | Purpose |
|---------|---------|
| `chargeTripConfirmation` | Charges $2 + $1/collaborator when pay-per-trip user confirms a trip |
| `chargeCollaboratorJoin` | Charges $1 when a collaborator joins a trip (individual/LTD plans) |
| `savePaymentMethod` | Saves Stripe Customer + PaymentMethod for pay-per-trip users |

---

## 4. Pay-Per-Trip: Adding a Payment Method

Pay-per-trip users need to add a card before confirming their first trip. You’ll need:

1. **Stripe Elements** or **Stripe Checkout** to collect the card.
2. A **SetupIntent** to attach a PaymentMethod to a Stripe Customer.
3. A call to `savePaymentMethod` Cloud Function with the Customer ID and Payment Method ID.

**Suggested flow:**

- Add an “Add payment method” section in Profile or Settings.
- Use Stripe.js (`loadStripe`) + `stripe.confirmCardSetup()` with a SetupIntent.
- On success, call `savePaymentMethod` with the Customer ID and Payment Method ID.
- Write to `licenses/{userId}` with `plan: 'pay_per_trip'`, `stripeCustomerId`, `stripePaymentMethodId`.

Until this UI exists, pay-per-trip users will see an error when confirming a trip: “No payment method on file.”

---

## 5. Subscription Webhooks (Optional)

To sync subscription status with Firestore:

1. Create a webhook in Stripe Dashboard → Developers → Webhooks.
2. Endpoint: `https://us-central1-YOUR_PROJECT.cloudfunctions.net/stripeWebhook` (create this function).
3. Subscribe to: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`.
4. In the webhook handler, update `licenses/{userId}` with `plan`, `status`, `stripeSubscriptionId`, etc.

---

## 6. Firestore Data Structure

### `licenses/{userId}`

```json
{
  "plan": "pay_per_trip" | "individual_monthly" | "individual_annual" | "business_monthly" | "business_annual" | "ltd",
  "status": "active",
  "stripeCustomerId": "cus_xxx",
  "stripePaymentMethodId": "pm_xxx",
  "stripeSubscriptionId": "sub_xxx",
  "purchasedAt": "<timestamp>"
}
```

### `charges` collection (audit log)

Stores each charge with `userId`, `planId`, `type`, `amountCents`, `stripePaymentIntentId`, etc.

---

## 7. Security Rules

Ensure Firestore rules allow:

- Users can read their own `licenses/{userId}`.
- Only Cloud Functions or admin can write to `licenses`.
- Users can read their own `notifications` where `userId` matches.

---

## Summary Checklist

- [ ] Create Stripe Products & Payment Links for all plans
- [ ] Add env vars to `.env` and Vercel
- [ ] Set `stripe.secret` in Firebase Functions config
- [ ] Deploy Cloud Functions (`firebase deploy --only functions`)
- [ ] Add payment-method collection UI for pay-per-trip
- [ ] (Optional) Add Stripe webhook for subscription sync

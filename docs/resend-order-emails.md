# Resend order emails — FORGE

After a successful Stripe payment, the webhook sends:

1. **Customer** — “Order confirmed · FORGE GYM”
2. **Owner** — “New order …” (to `ORDER_NOTIFY_EMAIL` or `contact@forgegym.us`)

Code: `lib/email/order-confirmation.ts` ← `app/api/webhooks/stripe/route.ts`  
Checkout collects email on `/checkout` and sets Stripe `receipt_email`.

---

## What you need to create (no password sharing)

You do **not** need to give anyone your Capacity Gears / Gmail password.

### 1. Resend account
1. Go to [https://resend.com](https://resend.com)  
2. Sign up / log in with **any** email you control (capacitygears@… is fine)  
3. **API Keys** → Create → copy `re_…`

### 2. Domain (production)
1. Resend → **Domains** → Add `forgegym.us`  
2. Add the DNS records Resend shows (at your domain registrar)  
3. Wait until status is **Verified**  
4. Use a from address on that domain, e.g. `orders@forgegym.us`

### 3. Quick test without domain (optional)
- From: `FORGE GYM <onboarding@resend.dev>`  
- Resend only allows sending **to your account email** until a domain is verified.

### 4. Vercel env (Production + Preview as needed)

```bash
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=FORGE GYM <orders@forgegym.us>
ORDER_NOTIFY_EMAIL=contact@forgegym.us
```

Redeploy after adding env vars.

### 5. Stripe webhook events
Endpoint: `https://forgegym.us/api/webhooks/stripe`  
Ensure **`payment_intent.succeeded`** is enabled (required for on-site checkout emails + inventory).

---

## Verify
1. Test-mode checkout on the site with your real email  
2. Pay with Stripe test card `4242…`  
3. Customer + owner emails arrive  
4. Resend dashboard shows the send  
5. Inventory still decrements in `/admin/inventory`

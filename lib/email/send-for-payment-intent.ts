import "server-only";

import type Stripe from "stripe";
import {
  emailFromPaymentIntent,
  sendOrderConfirmationEmails,
} from "@/lib/email/order-confirmation";

/**
 * Load a paid PaymentIntent and send order emails (idempotent via Resend keys).
 */
export async function sendEmailsForPaymentIntent(
  stripe: Stripe,
  paymentIntentId: string,
  fallbackEmail?: string,
): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  const full = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  });

  if (full.status !== "succeeded") {
    return { sent: false, skipped: `payment_not_succeeded:${full.status}` };
  }

  let email =
    emailFromPaymentIntent(full, full.latest_charge as Stripe.Charge) ||
    full.metadata?.customer_email?.trim() ||
    fallbackEmail?.trim() ||
    "";

  // Persist email on the PI when we only have a fallback (helps webhooks / retries).
  if (email && !full.receipt_email) {
    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        receipt_email: email,
        metadata: {
          ...full.metadata,
          customer_email: email,
        },
      });
    } catch (error) {
      console.warn("[email] could not attach receipt_email on PI:", error);
    }
  }

  const lineSummary = full.description?.trim() || "FORGE GYM order";

  return sendOrderConfirmationEmails({
    orderId: full.id,
    customerEmail: email,
    lineSummary,
    amountCents: full.amount_received || full.amount,
    currency: full.currency,
  });
}

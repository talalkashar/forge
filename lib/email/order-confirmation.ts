import "server-only";

import { Resend } from "resend";
import { site } from "@/lib/site";

export type OrderEmailInput = {
  /** Stripe PaymentIntent id or Checkout Session id */
  orderId: string;
  customerEmail: string;
  /** Human-readable line summary (from Stripe description or built list) */
  lineSummary: string;
  /** Amount in cents */
  amountCents: number;
  currency?: string;
};

function formatUsd(cents: number, currency = "usd") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function resendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `FORGE GYM <orders@${new URL(site.url).hostname}>`
  );
}

function notifyAddress() {
  return (
    process.env.ORDER_NOTIFY_EMAIL?.trim() ||
    process.env.RESEND_NOTIFY_EMAIL?.trim() ||
    site.email
  );
}

function customerHtml(input: OrderEmailInput) {
  const total = formatUsd(input.amountCents, input.currency);
  const shortId = input.orderId.slice(0, 20);

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#000;color:#f5f5f5;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#dc2626;font-weight:700;">FORGE GYM</p>
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;font-weight:900;color:#fff;">Order confirmed</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.65);">
      Payment cleared. We&apos;re getting your gear ready to ship.
    </p>
    <div style="border:1px solid rgba(255,255,255,0.12);padding:16px 18px;margin:0 0 20px;background:#0a0a0a;">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Items</p>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:#fff;">${escapeHtml(input.lineSummary)}</p>
      <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Total</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#fff;">${total}</p>
    </div>
    <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.4);">Reference: ${escapeHtml(shortId)}</p>
    <p style="margin:0 0 24px;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.5);">
      Questions? Reply to this email or write
      <a href="mailto:${site.email}" style="color:#f87171;">${site.email}</a>.
    </p>
    <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.3);">
      <a href="${site.url}" style="color:rgba(255,255,255,0.55);text-decoration:none;">forgegym.us</a>
      · Train hard. Recover. Repeat.
    </p>
  </div>
</body>
</html>`;
}

function ownerHtml(input: OrderEmailInput) {
  const total = formatUsd(input.amountCents, input.currency);
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#111;color:#eee;padding:24px;">
  <h2 style="margin:0 0 12px;">New FORGE order</h2>
  <p><strong>Total:</strong> ${total}</p>
  <p><strong>Customer:</strong> ${escapeHtml(input.customerEmail)}</p>
  <p><strong>Items:</strong> ${escapeHtml(input.lineSummary)}</p>
  <p><strong>Stripe id:</strong> ${escapeHtml(input.orderId)}</p>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Send customer confirmation + optional owner notify.
 * No-ops when RESEND_API_KEY is missing. Never throws — logs failures.
 */
export async function sendOrderConfirmationEmails(
  input: OrderEmailInput,
): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  const email = input.customerEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { sent: false, skipped: "missing_customer_email" };
  }

  const resend = resendClient();
  if (!resend) {
    return { sent: false, skipped: "resend_not_configured" };
  }

  const from = fromAddress();
  const total = formatUsd(input.amountCents, input.currency);

  try {
    const customerResult = await resend.emails.send(
      {
        from,
        to: email,
        replyTo: site.email,
        subject: `Order confirmed · FORGE GYM · ${total}`,
        html: customerHtml(input),
        tags: [
          { name: "type", value: "order_confirmation" },
          { name: "order_id", value: input.orderId.slice(0, 48) },
        ],
      },
      { idempotencyKey: `forge-order-customer-${input.orderId}` },
    );

    if (customerResult.error) {
      console.error("[email] customer confirmation failed:", customerResult.error);
      return { sent: false, error: customerResult.error.message };
    }

    const notify = notifyAddress();
    if (notify && notify.toLowerCase() !== email) {
      const ownerResult = await resend.emails.send(
        {
          from,
          to: notify,
          subject: `New order ${total} · FORGE GYM`,
          html: ownerHtml(input),
          tags: [
            { name: "type", value: "order_notify" },
            { name: "order_id", value: input.orderId.slice(0, 48) },
          ],
        },
        { idempotencyKey: `forge-order-owner-${input.orderId}` },
      );

      if (ownerResult.error) {
        console.error("[email] owner notify failed:", ownerResult.error);
      }
    }

    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "email_send_failed";
    console.error("[email] sendOrderConfirmationEmails:", message);
    return { sent: false, error: message };
  }
}

/** Resolve best customer email from a PaymentIntent (+ optional expanded charge). */
export function emailFromPaymentIntent(
  paymentIntent: {
    receipt_email?: string | null;
    latest_charge?: unknown;
    metadata?: { customer_email?: string | null } | null;
  },
  charge?: {
    billing_details?: { email?: string | null } | null;
    receipt_email?: string | null;
  } | null,
): string {
  const fromPi = paymentIntent.receipt_email?.trim();
  if (fromPi) return fromPi;

  const fromMeta = paymentIntent.metadata?.customer_email?.trim();
  if (fromMeta) return fromMeta;

  const latest = paymentIntent.latest_charge;
  const chargeObj =
    charge ??
    (latest && typeof latest === "object" && latest !== null && "billing_details" in latest
      ? (latest as {
          billing_details?: { email?: string | null };
          receipt_email?: string | null;
        })
      : null);

  return (
    chargeObj?.billing_details?.email?.trim() ||
    chargeObj?.receipt_email?.trim() ||
    ""
  );
}

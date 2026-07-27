import "server-only";

import { randomBytes } from "crypto";
import { Resend } from "resend";
import { site } from "@/lib/site";

export type OrderEmailInput = {
  /** Stripe PaymentIntent id or Checkout Session id (internal) */
  orderId: string;
  customerEmail: string;
  /** Human-readable line summary (from Stripe description or built list) */
  lineSummary: string;
  /** Amount in cents */
  amountCents: number;
  currency?: string;
  /**
   * Customer-facing order number (e.g. FORGE-K7M2P9).
   * Prefer metadata.order_number from Stripe when present.
   */
  orderNumber?: string;
};

/** Alphabet without ambiguous 0/O/1/I for customer-facing codes. */
const ORDER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Customer-facing order number for emails / support.
 * Prefers Stripe metadata `order_number`, else formats a short FORGE- code from the Stripe id.
 */
export function formatOrderNumber(
  orderId: string,
  explicit?: string | null,
): string {
  const trimmed = explicit?.trim();
  if (trimmed && /^FORGE-[A-Z0-9]{4,12}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (trimmed && trimmed.length >= 4 && trimmed.length <= 24) {
    // Already a custom short code from metadata
    return trimmed.toUpperCase().startsWith("FORGE-")
      ? trimmed.toUpperCase()
      : `FORGE-${trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}`;
  }

  const seed = orderId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const chunk = (seed.slice(-8) || "ORDER").padStart(6, "X").slice(-8);
  return `FORGE-${chunk}`;
}

/** Mint a new FORGE-XXXXXX code at PaymentIntent create time. */
export function createOrderNumber(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < bytes.length; i++) {
    code += ORDER_CODE_ALPHABET[bytes[i]! % ORDER_CODE_ALPHABET.length];
  }
  return `FORGE-${code}`;
}

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

function displayOrderNumber(input: OrderEmailInput) {
  return formatOrderNumber(input.orderId, input.orderNumber);
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

function customerSubject(input: OrderEmailInput) {
  const total = formatUsd(input.amountCents, input.currency);
  return `You're locked in — FORGE order confirmed (${total})`;
}

function customerText(input: OrderEmailInput) {
  const total = formatUsd(input.amountCents, input.currency);
  const orderNumber = displayOrderNumber(input);
  return [
    "FORGE GYM — ORDER CONFIRMED",
    "",
    "Payment cleared. Your gear is locked in and we're getting it ready to ship.",
    "",
    `Items: ${input.lineSummary}`,
    `Total paid: ${total}`,
    `Order number: ${orderNumber}`,
    "",
    "What happens next:",
    "1. We pack your order",
    "2. You get shipping updates by email when available",
    "3. Train hard when it lands",
    "",
    `Shop: ${site.url}`,
    `Help: ${site.email}`,
    "",
    "Train hard. Recover. Repeat.",
  ].join("\n");
}

function customerHtml(input: OrderEmailInput) {
  const total = formatUsd(input.amountCents, input.currency);
  const orderNumber = displayOrderNumber(input);
  const shopUrl = site.url;
  const preheader =
    `Order ${orderNumber} · ${total} · ${input.lineSummary}`.slice(0, 140);

  // Table-based layout for Gmail. Light shell + bold FORGE block so it pops in inbox preview + open.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <title>FORGE order confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f3f3f3;color:#111;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <!-- Preheader (inbox preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    ${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f3f3;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#0a0a0a;border:1px solid #222;">
          <!-- Red brand bar -->
          <tr>
            <td style="background:#dc2626;padding:14px 24px;">
              <p style="margin:0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:800;color:#fff;">FORGE GYM</p>
            </td>
          </tr>
          <!-- Hero -->
          <tr>
            <td style="padding:28px 24px 8px 24px;">
              <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;color:#f87171;">Order confirmed</p>
              <h1 style="margin:0 0 12px;font-size:30px;line-height:1.15;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">
                You&apos;re locked in.
              </h1>
              <p style="margin:0;font-size:16px;line-height:1.55;color:#d4d4d4;">
                Payment cleared. We&apos;re packing your gear and getting it ready to ship.
              </p>
            </td>
          </tr>
          <!-- Total callout -->
          <tr>
            <td style="padding:20px 24px 8px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#141414;border:1px solid #2a2a2a;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a3a3a3;font-weight:700;">Total paid</p>
                    <p style="margin:0;font-size:32px;line-height:1;font-weight:900;color:#ffffff;">${total}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Items -->
          <tr>
            <td style="padding:16px 24px 8px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#141414;border:1px solid #2a2a2a;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a3a3a3;font-weight:700;">Items</p>
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;font-weight:600;color:#ffffff;">${escapeHtml(input.lineSummary)}</p>
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a3a3a3;font-weight:700;">Order number</p>
                    <p style="margin:0;font-size:18px;line-height:1.2;font-weight:800;letter-spacing:0.06em;color:#ffffff;">${escapeHtml(orderNumber)}</p>
                    <p style="margin:8px 0 0;font-size:12px;line-height:1.4;color:#737373;">Save this for support — it&apos;s your order ID.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Next steps -->
          <tr>
            <td style="padding:16px 24px 8px 24px;">
              <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a3a3a3;font-weight:700;">What happens next</p>
              <p style="margin:0 0 6px;font-size:14px;line-height:1.5;color:#e5e5e5;">1. We pack your order</p>
              <p style="margin:0 0 6px;font-size:14px;line-height:1.5;color:#e5e5e5;">2. Shipping updates by email when available</p>
              <p style="margin:0;font-size:14px;line-height:1.5;color:#e5e5e5;">3. Train hard when it lands</p>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:24px 24px 8px 24px;" align="center">
              <a href="${shopUrl}/shop" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-size:13px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;padding:16px 28px;border-radius:999px;">
                Keep shopping
              </a>
            </td>
          </tr>
          <!-- Support -->
          <tr>
            <td style="padding:20px 24px 28px 24px;">
              <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#a3a3a3;">
                Questions? Reply to this email or write
                <a href="mailto:${site.email}" style="color:#f87171;font-weight:600;">${site.email}</a>.
              </p>
              <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#737373;">
                <a href="${shopUrl}" style="color:#a3a3a3;text-decoration:none;">forgegym.us</a>
                · Train hard. Recover. Repeat.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#737373;text-align:center;">
          CAPACITY GEARS LLC · FORGE GYM
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ownerHtml(input: OrderEmailInput) {
  const total = formatUsd(input.amountCents, input.currency);
  const orderNumber = displayOrderNumber(input);
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#111;color:#eee;padding:24px;">
  <h2 style="margin:0 0 12px;">New FORGE order</h2>
  <p><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p>
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
        subject: customerSubject(input),
        html: customerHtml(input),
        text: customerText(input),
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
      const orderNumber = displayOrderNumber(input);
      const ownerResult = await resend.emails.send(
        {
          from,
          to: notify,
          subject: `New order ${orderNumber} · ${total} · FORGE GYM`,
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

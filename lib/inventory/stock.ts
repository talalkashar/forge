import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/service-env";

export type InventoryLine = {
  variantId: string;
  sku: string;
  quantity: number;
};

/**
 * Decrement live Supabase inventory after a paid Stripe checkout.
 * Idempotent per external_order_id so webhook retries stay safe.
 */
export async function decrementInventoryForOrder(options: {
  externalOrderId: string;
  lines: InventoryLine[];
  channel?: "website" | "stripe";
  reason?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, error: "Supabase service role is not configured." };
  }

  const lines = options.lines.filter(
    (line) => line.variantId && Number.isFinite(line.quantity) && line.quantity > 0,
  );

  if (lines.length === 0) {
    return { ok: true };
  }

  const supabase = createSupabaseServiceRoleClient();
  const channel = options.channel ?? "stripe";
  const reason = options.reason ?? "stripe_checkout_completed";

  const { data: existing, error: existingError } = await supabase
    .from("inventory_movements")
    .select("id")
    .eq("external_order_id", options.externalOrderId)
    .limit(1);

  if (existingError) {
    return { ok: false, error: existingError.message };
  }

  if ((existing ?? []).length > 0) {
    // Already applied for this Stripe session / order id.
    return { ok: true };
  }

  for (const line of lines) {
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("id, sku, inventory_quantity")
      .eq("id", line.variantId)
      .maybeSingle();

    if (variantError) {
      return { ok: false, error: variantError.message };
    }

    if (!variant) {
      return { ok: false, error: `Variant not found: ${line.variantId}` };
    }

    const current = variant.inventory_quantity ?? 0;
    const nextQuantity = Math.max(0, current - line.quantity);

    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ inventory_quantity: nextQuantity })
      .eq("id", line.variantId);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    const { error: movementError } = await supabase.from("inventory_movements").insert({
      variant_id: line.variantId,
      channel,
      quantity_change: nextQuantity - current,
      reason,
      external_order_id: options.externalOrderId,
    });

    if (movementError) {
      return { ok: false, error: movementError.message };
    }
  }

  return { ok: true };
}

export function parseInventoryMetadata(
  raw: string | null | undefined,
): InventoryLine[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const row = entry as Record<string, unknown>;
        const variantId = typeof row.variantId === "string" ? row.variantId : "";
        const sku = typeof row.sku === "string" ? row.sku : "";
        const quantity = Math.max(0, Math.floor(Number(row.quantity) || 0));
        if (!variantId || quantity <= 0) return null;
        return { variantId, sku, quantity } satisfies InventoryLine;
      })
      .filter((line): line is InventoryLine => Boolean(line));
  } catch {
    return [];
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit, clientIp } from "@/lib/security/rate-limit";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import {
  clearAdminSession,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminPassword,
} from "./auth";
import { getAdminSetupStatus } from "./data";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function requiredText(formData: FormData, key: string) {
  const value = textValue(formData, key);

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function intValue(formData: FormData, key: string, fallback = 0) {
  const value = textValue(formData, key);
  const parsed = value ? Number.parseInt(value, 10) : fallback;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function adminClient() {
  if (!getAdminSetupStatus().ready) {
    throw new Error("Admin dashboard environment variables are not fully configured.");
  }

  return createSupabaseServiceRoleClient();
}

async function requireAdminSession() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }
}

export async function loginAdminAction(formData: FormData) {
  const headerStore = await headers();
  const rateLimit = checkRateLimit(`admin-login:${clientIp(headerStore)}`, {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });

  if (rateLimit.limited) {
    redirect("/admin?error=too_many_attempts");
  }

  const password = requiredText(formData, "password");

  if (!verifyAdminPassword(password)) {
    redirect("/admin?error=invalid_password");
  }

  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function createProductAction(formData: FormData) {
  await requireAdminSession();

  const supabase = adminClient();
  const slug = requiredText(formData, "slug");
  const name = requiredText(formData, "name");
  const category = requiredText(formData, "category");

  const { data, error } = await supabase
    .from("products")
    .insert({
      slug,
      name,
      subtitle: textValue(formData, "subtitle"),
      description: textValue(formData, "description"),
      category,
      status: textValue(formData, "status") ?? "draft",
      base_price_cents: intValue(formData, "base_price_cents"),
      currency: textValue(formData, "currency") ?? "USD",
      brand: textValue(formData, "brand") ?? "FORGE",
      is_featured: boolValue(formData, "is_featured"),
      sort_order: intValue(formData, "sort_order"),
    })
    .select("id, slug")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("marketplace_listings").insert({
    product_id: data.id,
    variant_id: null,
    channel: "website",
    external_product_id: null,
    external_listing_id: null,
    external_sku: data.slug,
    listing_url:
      category === "belt" ? `/product/belt?variant=${data.slug}` : `/product/${data.slug}`,
    sync_status: "not_connected",
    notes: "Website placeholder mapping.",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}`);
}

export async function updateProductAction(formData: FormData) {
  await requireAdminSession();

  const supabase = adminClient();
  const productId = requiredText(formData, "product_id");
  const { error } = await supabase
    .from("products")
    .update({
      slug: requiredText(formData, "slug"),
      name: requiredText(formData, "name"),
      subtitle: textValue(formData, "subtitle"),
      description: textValue(formData, "description"),
      category: requiredText(formData, "category"),
      status: textValue(formData, "status") ?? "draft",
      base_price_cents: intValue(formData, "base_price_cents"),
      currency: textValue(formData, "currency") ?? "USD",
      brand: textValue(formData, "brand") ?? "FORGE",
      is_featured: boolValue(formData, "is_featured"),
      sort_order: intValue(formData, "sort_order"),
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function createVariantAction(formData: FormData) {
  await requireAdminSession();

  const supabase = adminClient();
  const productId = requiredText(formData, "product_id");
  const sku = requiredText(formData, "sku");
  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      sku,
      name: requiredText(formData, "name"),
      size: textValue(formData, "size"),
      color: textValue(formData, "color"),
      price_cents: intValue(formData, "price_cents"),
      inventory_quantity: intValue(formData, "inventory_quantity"),
      stripe_price_id: textValue(formData, "stripe_price_id"),
      stripe_product_id: textValue(formData, "stripe_product_id"),
      is_active: boolValue(formData, "is_active"),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("marketplace_listings").insert(
    ["stripe", "amazon", "tiktok_shop"].map((channel) => ({
      product_id: productId,
      variant_id: data.id,
      channel,
      external_product_id: null,
      external_listing_id: null,
      external_sku: sku,
      listing_url: null,
      sync_status: "not_connected",
      notes: "Placeholder mapping for a new variant.",
    })),
  );

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariantAction(formData: FormData) {
  await requireAdminSession();

  const supabase = adminClient();
  const productId = requiredText(formData, "product_id");
  const variantId = requiredText(formData, "variant_id");
  const { error } = await supabase
    .from("product_variants")
    .update({
      sku: requiredText(formData, "sku"),
      name: requiredText(formData, "name"),
      size: textValue(formData, "size"),
      color: textValue(formData, "color"),
      price_cents: intValue(formData, "price_cents"),
      inventory_quantity: intValue(formData, "inventory_quantity"),
      stripe_price_id: textValue(formData, "stripe_price_id"),
      stripe_product_id: textValue(formData, "stripe_product_id"),
      is_active: boolValue(formData, "is_active"),
    })
    .eq("id", variantId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/inventory");
}

export async function updateMarketplaceListingAction(formData: FormData) {
  await requireAdminSession();

  const supabase = adminClient();
  const listingId = requiredText(formData, "listing_id");
  const { error } = await supabase
    .from("marketplace_listings")
    .update({
      external_product_id: textValue(formData, "external_product_id"),
      external_listing_id: textValue(formData, "external_listing_id"),
      external_sku: textValue(formData, "external_sku"),
      listing_url: textValue(formData, "listing_url"),
      sync_status: textValue(formData, "sync_status") ?? "not_connected",
      last_synced_at: textValue(formData, "last_synced_at"),
      notes: textValue(formData, "notes"),
    })
    .eq("id", listingId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/marketplace");
}

export async function adjustInventoryAction(formData: FormData) {
  await requireAdminSession();

  const supabase = adminClient();
  const variantId = requiredText(formData, "variant_id");
  const nextQuantity = intValue(formData, "inventory_quantity");
  const currentQuantity = intValue(formData, "current_inventory_quantity");
  const quantityChange = nextQuantity - currentQuantity;

  const { error: updateError } = await supabase
    .from("product_variants")
    .update({ inventory_quantity: nextQuantity })
    .eq("id", variantId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (quantityChange !== 0) {
    const { error: movementError } = await supabase
      .from("inventory_movements")
      .insert({
        variant_id: variantId,
        // Website mirror of TikTok Shop inventory (source of truth).
        channel: "manual",
        quantity_change: quantityChange,
        reason: "admin_adjustment_tiktok_aligned",
      });

    if (movementError) {
      throw new Error(movementError.message);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  // Storefront reads live Supabase inventory , bust catalog caches after edits.
  revalidatePath("/shop");
  revalidatePath("/shop/belts");
  revalidatePath("/shop/wrist-straps");
  revalidatePath("/product/belt");
  revalidatePath("/product/straps");
  revalidatePath("/");
}

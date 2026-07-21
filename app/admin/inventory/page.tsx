import Link from "next/link";
import { redirect } from "next/navigation";
import { adjustInventoryAction } from "@/lib/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminProducts, getAdminSetupStatus } from "@/lib/admin/data";
import { getTikTokProductUrl, tiktokShop } from "@/lib/tiktok-shop";
import {
  AdminCard,
  AdminShell,
  ErrorState,
  SetupWarning,
  SubmitButton,
} from "../components";

export default async function AdminInventoryPage() {
  const setup = getAdminSetupStatus();

  if (!setup.ready) {
    return <SetupWarning setup={setup} />;
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { data: products, error } = await getAdminProducts();

  if (error) {
    return (
      <AdminShell>
        <ErrorState message={error} />
      </AdminShell>
    );
  }

  const rows = products.flatMap((product) =>
    (product.product_variants ?? []).map((variant) => {
      const tiktokListing =
        (product.marketplace_listings ?? []).find(
          (listing) =>
            listing.channel === "tiktok_shop" &&
            listing.variant_id === variant.id,
        ) ??
        (product.marketplace_listings ?? []).find(
          (listing) =>
            listing.channel === "tiktok_shop" && listing.variant_id === null,
        ) ??
        null;

      const tiktokUrl =
        tiktokListing?.listing_url || getTikTokProductUrl(product.slug);

      return {
        product,
        variant,
        tiktokListing,
        tiktokUrl,
      };
    }),
  );

  return (
    <AdminShell>
      <AdminCard title="TikTok Shop is inventory source of truth">
        <p className="text-sm leading-6 text-emerald-100">
          Always treat{" "}
          <a
            href={tiktokShop.storeUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-white underline-offset-2 hover:underline"
          >
            FORGE TikTok Shop
          </a>{" "}
          as the inventory reference. Supabase quantities power website checkout
          and must stay aligned with TikTok stock (same SKUs / product family).
        </p>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Store: {tiktokShop.storeName} · Seller: {tiktokShop.seller}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.14em]">
          <a
            href={tiktokShop.storeUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 px-4 py-2 text-white hover:border-white/35"
          >
            Open TikTok Shop
          </a>
          <Link
            href="/admin/sync/tiktok"
            className="rounded-full border border-white/15 px-4 py-2 text-white hover:border-white/35"
          >
            TikTok sync preview
          </Link>
          <span className="rounded-full border border-white/10 px-4 py-2 text-white/40">
            npm run inventory:status
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-amber-100">
          Before reseeding:{" "}
          <code className="text-white/80">npm run inventory:export</code>
        </p>
      </AdminCard>

      <AdminCard title="Inventory (TikTok-aligned)" className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.18em] text-gray-500">
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Size</th>
                <th className="px-3 py-3">Website qty</th>
                <th className="px-3 py-3">TikTok Shop</th>
                <th className="px-3 py-3">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {rows.map(({ product, variant, tiktokListing, tiktokUrl }) => (
                <tr key={variant.id} className="text-gray-300">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="mt-1 text-xs text-white/35">
                      {variant.name}
                      {variant.color ? ` · ${variant.color}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-4 font-mono text-xs text-white/70">
                    {variant.sku}
                  </td>
                  <td className="px-3 py-4">{variant.size ?? "—"}</td>
                  <td className="px-3 py-4">
                    <form
                      action={adjustInventoryAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="variant_id" value={variant.id} />
                      <input
                        type="hidden"
                        name="current_inventory_quantity"
                        value={variant.inventory_quantity ?? 0}
                      />
                      <input
                        name="inventory_quantity"
                        type="number"
                        defaultValue={variant.inventory_quantity ?? 0}
                        className="w-24 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-red-600/70"
                        aria-label={`Website inventory for ${variant.sku}`}
                      />
                      <SubmitButton>Save</SubmitButton>
                    </form>
                    {(variant.inventory_quantity ?? 0) <= 0 ? (
                      <p className="mt-2 text-xs font-bold text-amber-300">
                        Out of stock on website — check TikTok qty
                      </p>
                    ) : null}
                  </td>
                  <td className="max-w-xs px-3 py-4 text-xs leading-6">
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-red-300 hover:text-red-200"
                    >
                      TikTok listing →
                    </a>
                    <p className="mt-1 text-white/40">
                      Status: {tiktokListing?.sync_status ?? "not mapped"}
                    </p>
                    {tiktokListing?.external_product_id ? (
                      <p className="mt-1 font-mono text-[0.65rem] text-white/30">
                        ID {tiktokListing.external_product_id}
                      </p>
                    ) : (
                      <p className="mt-1 text-amber-200/80">
                        No TikTok product ID — map when PDP exists
                      </p>
                    )}
                    <p className="mt-1 text-white/35">
                      Match TikTok stock when you save website qty.
                    </p>
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-500">
                    mirrors TikTok
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </AdminShell>
  );
}

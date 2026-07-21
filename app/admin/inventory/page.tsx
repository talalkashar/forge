import { redirect } from "next/navigation";
import { adjustInventoryAction } from "@/lib/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminProducts, getAdminSetupStatus } from "@/lib/admin/data";
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
      const variantListings = (product.marketplace_listings ?? []).filter(
        (listing) =>
          listing.variant_id === variant.id ||
          (listing.variant_id === null && listing.channel === "website"),
      );

      return {
        product,
        variant,
        channelStatus: variantListings
          .map((listing) => `${listing.channel}: ${listing.sync_status}`)
          .join(" | "),
      };
    }),
  );

  return (
    <AdminShell>
      <AdminCard title="Live Supabase inventory">
        <p className="text-sm leading-6 text-emerald-100">
          Quantities below are read/written directly on{" "}
          <code className="text-white/80">product_variants.inventory_quantity</code>{" "}
          in Supabase. The storefront and checkout use these same rows — no demo
          stock.
        </p>
        <p className="mt-3 text-sm leading-6 text-amber-100">
          Before reseeding or schema resets:{" "}
          <code className="text-white/80">npm run inventory:export</code>
        </p>
      </AdminCard>

      <AdminCard title="Inventory" className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.18em] text-gray-500">
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Variant</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Size</th>
                <th className="px-3 py-3">Color</th>
                <th className="px-3 py-3">Inventory</th>
                <th className="px-3 py-3">Channel Listing Status</th>
                <th className="px-3 py-3">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {rows.map(({ product, variant, channelStatus }) => (
                <tr key={variant.id} className="text-gray-300">
                  <td className="px-3 py-4 font-semibold text-white">{product.name}</td>
                  <td className="px-3 py-4">{variant.name}</td>
                  <td className="px-3 py-4">{variant.sku}</td>
                  <td className="px-3 py-4">{variant.size ?? "-"}</td>
                  <td className="px-3 py-4">{variant.color ?? "-"}</td>
                  <td className="px-3 py-4">
                    <form action={adjustInventoryAction} className="flex items-center gap-2">
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
                      />
                      <SubmitButton>Save</SubmitButton>
                    </form>
                  </td>
                  <td className="max-w-md px-3 py-4 text-xs leading-6 text-gray-400">
                    {channelStatus || "No listings"}
                    {(variant.inventory_quantity ?? 0) <= 0 ? (
                      <span className="mt-2 block font-bold text-amber-300">
                        No inventory set
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-500">manual adjustment</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </AdminShell>
  );
}

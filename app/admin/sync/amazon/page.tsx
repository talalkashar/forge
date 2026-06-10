import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminSetupStatus } from "@/lib/admin/data";
import { getAmazonCredentialStatus } from "@/lib/marketplaces/amazon/env";
import { previewAmazonListingsImport } from "@/lib/marketplaces/amazon/listings";
import { previewAmazonOrdersImport } from "@/lib/marketplaces/amazon/orders";
import {
  AdminCard,
  AdminShell,
  SetupWarning,
  StatCard,
} from "../../components";

function statusLabel(status: string) {
  if (status === "not_configured") {
    return "Not configured";
  }

  if (status === "error") {
    return "Error";
  }

  if (status === "not_implemented") {
    return "Not implemented";
  }

  return "Ready to test";
}

function previewSummary(
  preview: Awaited<ReturnType<typeof previewAmazonListingsImport>>,
) {
  const rows = preview.data ?? [];
  const matched = rows.filter((row) => row.matchedVariantId).length;
  const manualReview = rows.filter((row) => row.matchReason === "manual_review").length;

  return {
    attempted: preview.status !== "not_configured",
    imported: rows.length,
    matched,
    unmatched: rows.length - matched,
    manualReview,
  };
}

export default async function AdminAmazonSyncPage() {
  const setup = getAdminSetupStatus();

  if (!setup.ready) {
    return <SetupWarning setup={setup} />;
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const [listingsPreview, ordersPreview] = await Promise.all([
    previewAmazonListingsImport(),
    previewAmazonOrdersImport(),
  ]);
  const credentials = getAmazonCredentialStatus();
  const listingsSummary = previewSummary(listingsPreview);

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
            Read-only Preview
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
            Amazon Sync Preview
          </h2>
        </div>
        <Link
          href="/admin/sync"
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white hover:border-red-600/60"
        >
          Back to Sync
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Credentials"
          value={credentials.configured ? "Configured" : "Missing"}
        />
        <StatCard label="Listings Import" value={statusLabel(listingsPreview.status)} />
        <StatCard label="Orders Import" value={statusLabel(ordersPreview.status)} />
      </div>

      <AdminCard title="Credential Readiness" className="mt-6">
        <div className="grid gap-3 text-sm text-gray-300 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.fields.map((field) => (
            <div
              key={field.key}
              className="rounded-2xl border border-white/10 bg-black/35 p-4"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                {field.label}
              </p>
              <p className={field.present ? "mt-2 text-emerald-300" : "mt-2 text-red-300"}>
                {field.present ? "Present" : "Missing"}
              </p>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Dry-run Import Preview" className="mt-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-bold text-white">Listings</p>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              {listingsPreview.message}
            </p>
            <dl className="mt-5 grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
              <div>Fetch attempted: {listingsSummary.attempted ? "Yes" : "No"}</div>
              <div>Imported: {listingsSummary.imported}</div>
              <div>Matched: {listingsSummary.matched}</div>
              <div>Unmatched: {listingsSummary.unmatched}</div>
              <div>Manual review: {listingsSummary.manualReview}</div>
            </dl>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-bold text-white">Orders</p>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              {ordersPreview.message}
            </p>
          </div>
        </div>
      </AdminCard>

      {listingsPreview.data && listingsPreview.data.length > 0 ? (
        <AdminCard title="Proposed Listing Mappings" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-gray-500">
                <tr>
                  <th className="px-3 py-2">Amazon SKU</th>
                  <th className="px-3 py-2">ASIN</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Inventory</th>
                  <th className="px-3 py-2">Matched FORGE SKU</th>
                  <th className="px-3 py-2">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-gray-300">
                {listingsPreview.data.map((row) => (
                  <tr key={`${row.sellerSku}-${row.asin ?? "no-asin"}`}>
                    <td className="px-3 py-3 font-mono text-xs text-white">{row.sellerSku}</td>
                    <td className="px-3 py-3 font-mono text-xs">{row.asin ?? "Missing"}</td>
                    <td className="px-3 py-3">{row.title ?? "Untitled"}</td>
                    <td className="px-3 py-3">{row.status ?? "Unknown"}</td>
                    <td className="px-3 py-3">{row.inventoryQuantity ?? "Unknown"}</td>
                    <td className="px-3 py-3">
                      {row.matchedSku
                        ? `${row.matchedProductName ?? "FORGE"} / ${row.matchedSku}`
                        : "Manual review"}
                    </td>
                    <td className="px-3 py-3">{row.matchReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Preview only. No Amazon listing, inventory, order, or Supabase writes run from this page.
          </p>
        </AdminCard>
      ) : null}

      <AdminCard title="Future Matching Model" className="mt-6">
        <ol className="space-y-3 text-sm leading-6 text-gray-300">
          <li>1. Match imported Amazon listings by existing marketplace external SKU.</li>
          <li>2. Match unmatched rows by Supabase variant SKU.</li>
          <li>3. Match by ASIN only when an ASIN is already stored in Supabase.</li>
          <li>4. Send anything ambiguous to manual review before any write sync exists.</li>
        </ol>
      </AdminCard>
    </AdminShell>
  );
}

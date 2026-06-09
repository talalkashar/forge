import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminSetupStatus } from "@/lib/admin/data";
import { getTikTokCredentialStatus } from "@/lib/marketplaces/tiktok/env";
import { previewTikTokOrdersImport } from "@/lib/marketplaces/tiktok/orders";
import { getTikTokOAuthScaffoldStatus } from "@/lib/marketplaces/tiktok/oauth";
import { previewTikTokProductsImport } from "@/lib/marketplaces/tiktok/products";
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

  if (status === "not_implemented") {
    return "Not implemented";
  }

  return "Ready to test";
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

export default async function AdminTikTokSyncPage() {
  const setup = getAdminSetupStatus();

  if (!setup.ready) {
    return <SetupWarning setup={setup} />;
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const [productsPreview, ordersPreview] = await Promise.all([
    previewTikTokProductsImport(),
    previewTikTokOrdersImport(),
  ]);
  const credentials = getTikTokCredentialStatus();
  const oauth = getTikTokOAuthScaffoldStatus();
  const missingTokenKeys = credentials.missingKeys.filter((key) =>
    [
      "TIKTOK_SHOP_ACCESS_TOKEN",
      "TIKTOK_SHOP_REFRESH_TOKEN",
      "TIKTOK_SHOP_ID",
    ].includes(key),
  );

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
            Read-only Preview
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
            TikTok Shop Sync Preview
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
          value={
            credentials.configured
              ? "Configured"
              : credentials.appShellConfigured
                ? "Partial"
                : "Missing"
          }
        />
        <StatCard label="Product Import" value={statusLabel(productsPreview.status)} />
        <StatCard label="Orders Import" value={statusLabel(ordersPreview.status)} />
      </div>

      <AdminCard title="OAuth Readiness" className="mt-6">
        <div className="grid gap-4 text-sm leading-6 text-gray-300 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              App Shell
            </p>
            <p
              className={
                credentials.appShellConfigured
                  ? "mt-2 font-bold text-emerald-300"
                  : "mt-2 font-bold text-red-300"
              }
            >
              {credentials.appShellConfigured ? "Created / partial" : "Missing"}
            </p>
            <div className="mt-3 space-y-1 text-gray-400">
              <p>App key present: {yesNo(credentials.appKeyPresent)}</p>
              <p>App secret present: {yesNo(credentials.appSecretPresent)}</p>
              <p>Region present: {yesNo(credentials.regionPresent)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Callback Route
            </p>
            <p
              className={
                oauth.callbackRouteReady
                  ? "mt-2 font-bold text-emerald-300"
                  : "mt-2 font-bold text-red-300"
              }
            >
              {oauth.callbackRouteReady ? "Ready" : "Missing"}
            </p>
            <p className="mt-3 break-all font-mono text-xs text-gray-400">
              {oauth.callbackPath}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
              TikTok Review
            </p>
            <p className="mt-2 font-bold text-amber-100">
              Authorization still blocked by TikTok review/publish steps.
            </p>
            <p className="mt-3 text-gray-300">
              Complete company details, partner registration, US data security,
              data security/privacy, app review, then seller authorization.
            </p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
              Token Exchange
            </p>
            <p className="mt-2 font-bold text-red-200">
              {oauth.tokenExchangeEnabled ? "Enabled" : "Disabled"}
            </p>
            <p className="mt-3 text-gray-300">
              No token exchange, token storage, Supabase mutation, or TikTok API call
              runs from the callback route yet.
            </p>
          </div>
        </div>
      </AdminCard>

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
        {missingTokenKeys.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-100">
            <p className="font-bold">Missing seller authorization values</p>
            <p className="mt-2 font-mono text-xs text-red-200">
              {missingTokenKeys.join(", ")}
            </p>
          </div>
        ) : null}
      </AdminCard>

      <AdminCard title="Dry-run Import Preview" className="mt-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-bold text-white">Products</p>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              {productsPreview.message}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="font-bold text-white">Orders</p>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              {ordersPreview.message}
            </p>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Future Matching Model" className="mt-6">
        <ol className="space-y-3 text-sm leading-6 text-gray-300">
          <li>1. Match imported TikTok Shop rows by existing marketplace external SKU.</li>
          <li>2. Match unmatched rows by Supabase variant SKU.</li>
          <li>3. Match by product/listing ID only when one is already stored in Supabase.</li>
          <li>4. Send anything ambiguous to manual review before any write sync exists.</li>
        </ol>
      </AdminCard>
    </AdminShell>
  );
}

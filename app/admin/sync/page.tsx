import { readdir } from "node:fs/promises";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  getAdminSetupStatus,
  getMarketplaceSyncReadiness,
  type SyncReadinessChannel,
} from "@/lib/admin/data";
import { getAmazonCredentialStatus } from "@/lib/marketplaces/amazon/env";
import { previewAmazonListingsImport } from "@/lib/marketplaces/amazon/listings";
import { previewAmazonOrdersImport } from "@/lib/marketplaces/amazon/orders";
import { getTikTokCredentialStatus } from "@/lib/marketplaces/tiktok/env";
import { previewTikTokOrdersImport } from "@/lib/marketplaces/tiktok/orders";
import { previewTikTokProductsImport } from "@/lib/marketplaces/tiktok/products";
import {
  AdminCard,
  AdminShell,
  ErrorState,
  SetupWarning,
  StatCard,
} from "../components";

function readinessLabel(channel: SyncReadinessChannel) {
  if (channel.total === 0) {
    return "Not configured";
  }

  if (channel.ready === channel.total && channel.needsReview === 0) {
    return "Ready";
  }

  if (channel.ready > 0) {
    return "Partial";
  }

  return "Blocked";
}

function readinessColor(channel: SyncReadinessChannel) {
  const label = readinessLabel(channel);

  if (label === "Ready") {
    return "text-emerald-300";
  }

  if (label === "Partial") {
    return "text-amber-300";
  }

  return "text-red-300";
}

function connectorStatusLabel(status: string) {
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

async function getLatestInventoryBackupFilename() {
  try {
    const files = await readdir("backups");

    return (
      files
        .filter((file) => /^inventory-snapshot-.+\.json$/.test(file))
        .sort()
        .at(-1) ?? null
    );
  } catch {
    return null;
  }
}

export default async function AdminSyncPage() {
  const setup = getAdminSetupStatus();

  if (!setup.ready) {
    return <SetupWarning setup={setup} />;
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const [
    { data: readiness, error },
    latestBackup,
    amazonListingsPreview,
    amazonOrdersPreview,
    tiktokProductsPreview,
    tiktokOrdersPreview,
  ] = await Promise.all([
    getMarketplaceSyncReadiness(),
    getLatestInventoryBackupFilename(),
    previewAmazonListingsImport(),
    previewAmazonOrdersImport(),
    previewTikTokProductsImport(),
    previewTikTokOrdersImport(),
  ]);

  if (error) {
    return (
      <AdminShell>
        <ErrorState message={error} />
      </AdminShell>
    );
  }

  const totalMissing = readiness.channels.reduce(
    (total, channel) => total + channel.missing,
    0,
  );
  const needsReview = readiness.channels.reduce(
    (total, channel) => total + channel.needsReview,
    0,
  );
  const missingImages = readiness.products.reduce(
    (total, product) => total + product.missingImages,
    0,
  );
  const missingSkus = readiness.products.reduce(
    (total, product) => total + product.missingSkus,
    0,
  );
  const inventoryWarnings = readiness.products.reduce(
    (total, product) => total + product.inventoryWarnings,
    0,
  );
  const amazonCredentials = getAmazonCredentialStatus();
  const tiktokCredentials = getTikTokCredentialStatus();
  const amazonChannel = readiness.channels.find(
    (channel) => channel.channel === "amazon",
  );
  const tiktokChannel = readiness.channels.find(
    (channel) => channel.channel === "tiktok_shop",
  );

  return (
    <AdminShell>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Channels" value={readiness.channels.length} />
        <StatCard label="Missing Mappings" value={totalMissing} />
        <StatCard label="Needs Review" value={needsReview} />
        <StatCard label="Missing Images" value={missingImages} />
        <StatCard label="Missing SKUs" value={missingSkus} />
        <StatCard label="Inventory Warnings" value={inventoryWarnings} />
      </div>

      <AdminCard title="Automation Status" className="mt-6">
        <div className="grid gap-4 text-sm leading-6 text-gray-300 lg:grid-cols-2">
          <div>
            <p className="font-bold text-white">Amazon and TikTok Shop sync is not active yet.</p>
            <p className="mt-2">
              This page is read-only. It checks FORGE catalog readiness, missing IDs,
              review states, SKU coverage, image coverage, and inventory warnings before
              any future connector writes are enabled.
            </p>
            <Link
              href="/admin/stripe"
              className="mt-4 inline-flex rounded-full border border-red-600/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-red-600/10"
            >
              Open Stripe Setup
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
              Latest Inventory Backup
            </p>
            <p className="mt-2 break-all font-mono text-sm text-white">
              {latestBackup ?? "No local backup found"}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Export inventory before any future schema reset, seed rerun, or bulk sync.
            </p>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Sync Readiness" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {readiness.channels.map((channel) => (
            <div
              key={channel.channel}
              className="rounded-2xl border border-white/10 bg-black/35 p-4"
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
                {channel.label}
              </p>
              <p className={`mt-3 text-2xl font-black ${readinessColor(channel)}`}>
                {readinessLabel(channel)}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                {channel.ready} of {channel.total} ready
              </p>
              {channel.blockers.length > 0 ? (
                <ul className="mt-4 space-y-2 text-xs leading-5 text-gray-400">
                  {channel.blockers.map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Marketplace Connector Readiness" className="mt-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
                  Amazon
                </p>
                <p
                  className={`mt-3 text-2xl font-black ${
                    amazonCredentials.configured ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {amazonCredentials.configured
                    ? "Credentials configured"
                    : "Credentials missing"}
                </p>
              </div>
              <Link
                href="/admin/sync/amazon"
                className="rounded-full border border-red-600/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-red-600/10"
              >
                Preview
              </Link>
            </div>
            <dl className="mt-5 grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
              <div>Seller ID: {yesNo(amazonCredentials.sellerIdPresent)}</div>
              <div>Marketplace ID: {yesNo(amazonCredentials.marketplaceIdPresent)}</div>
              <div>Refresh token: {yesNo(amazonCredentials.refreshTokenPresent)}</div>
              <div>Missing mappings: {amazonChannel?.missing ?? 0}</div>
              <div>Listings import: {connectorStatusLabel(amazonListingsPreview.status)}</div>
              <div>Orders import: {connectorStatusLabel(amazonOrdersPreview.status)}</div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-gray-400">
              {amazonCredentials.configured
                ? "Next safe action: implement read-only listing import preview and compare results against Supabase SKUs."
                : "Next safe action: add Amazon SP-API credentials, then test read-only listing import preview."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
                  TikTok Shop
                </p>
                <p
                  className={`mt-3 text-2xl font-black ${
                    tiktokCredentials.configured ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {tiktokCredentials.configured
                    ? "Credentials configured"
                    : "Credentials missing"}
                </p>
              </div>
              <Link
                href="/admin/sync/tiktok"
                className="rounded-full border border-red-600/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-red-600/10"
              >
                Preview
              </Link>
            </div>
            <dl className="mt-5 grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
              <div>App key: {yesNo(tiktokCredentials.appKeyPresent)}</div>
              <div>Shop ID: {yesNo(tiktokCredentials.shopIdPresent)}</div>
              <div>Access token: {yesNo(tiktokCredentials.accessTokenPresent)}</div>
              <div>Refresh token: {yesNo(tiktokCredentials.refreshTokenPresent)}</div>
              <div>Missing mappings: {tiktokChannel?.missing ?? 0}</div>
              <div>Product import: {connectorStatusLabel(tiktokProductsPreview.status)}</div>
              <div>Orders import: {connectorStatusLabel(tiktokOrdersPreview.status)}</div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-gray-400">
              {tiktokCredentials.configured
                ? "Next safe action: implement read-only product import preview and compare results against Supabase SKUs."
                : "Next safe action: add TikTok Shop API credentials, then test read-only product import preview."}
            </p>
          </div>
        </div>
      </AdminCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminCard title="Product Blockers">
          <div className="space-y-4">
            {readiness.products.map((product) => (
              <div
                key={product.productId}
                className="rounded-2xl border border-white/10 bg-black/35 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-white">{product.productName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">
                      {product.productSlug}
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${product.productId}`}
                    className="text-sm font-bold text-red-400 hover:text-red-300"
                  >
                    Edit product
                  </Link>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-gray-400 sm:grid-cols-4">
                  <p>Images: {product.imageCount}</p>
                  <p>Variants: {product.variantCount}</p>
                  <p>Inventory: {product.inventoryTotal}</p>
                  <p>Review: {product.needsReview}</p>
                  <p>Missing SKUs: {product.missingSkus}</p>
                  <p>Missing Stripe: {product.missingStripeIds}</p>
                  <p>Missing Amazon: {product.missingAmazonIds}</p>
                  <p>Missing TikTok: {product.missingTikTokIds}</p>
                </div>
                {product.blockers.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-sm text-amber-100">
                    {product.blockers.map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-emerald-300">
                    Product is ready for dry-run marketplace sync.
                  </p>
                )}
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Next Actions">
          <ol className="space-y-3 text-sm leading-6 text-gray-300">
            {readiness.nextActions.map((action, index) => (
              <li key={action}>
                <span className="mr-2 font-black text-red-400">{index + 1}.</span>
                {action}
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/stripe"
              className="rounded-full border border-red-600/50 px-4 py-2 text-sm font-bold text-white hover:bg-red-600/10"
            >
              Stripe Setup
            </Link>
            <Link
              href="/admin/marketplace?missing=1"
              className="rounded-full border border-red-600/50 px-4 py-2 text-sm font-bold text-white hover:bg-red-600/10"
            >
              Fill Missing IDs
            </Link>
            <Link
              href="/admin/inventory"
              className="rounded-full border border-red-600/50 px-4 py-2 text-sm font-bold text-white hover:bg-red-600/10"
            >
              Check Inventory
            </Link>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}

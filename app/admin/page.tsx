import Link from "next/link";
import { loginAdminAction } from "@/lib/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  getAdminProducts,
  getAdminSetupStatus,
  getMarketplaceDashboardStats,
} from "@/lib/admin/data";
import {
  AdminCard,
  AdminShell,
  ErrorState,
  SetupWarning,
  StatCard,
  SubmitButton,
} from "./components";

export default async function AdminPage() {
  const setup = getAdminSetupStatus();

  if (!setup.ready) {
    return <SetupWarning setup={setup} />;
  }

  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.18),transparent_30%),linear-gradient(180deg,#050505_0%,#000_65%)] px-6 py-20 text-white">
        <section className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <p className="text-xs font-black uppercase tracking-[0.36em] text-red-500">
            FORGE Admin
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Sign in
          </h1>
          <form action={loginAdminAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                Admin Password
              </span>
              <input
                name="password"
                type="password"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-red-600/70"
              />
            </label>
            <SubmitButton>Log In</SubmitButton>
          </form>
        </section>
      </main>
    );
  }

  const [statsResult, productsResult] = await Promise.all([
    getMarketplaceDashboardStats(),
    getAdminProducts(),
  ]);

  if (statsResult.error || productsResult.error) {
    return (
      <AdminShell>
        <ErrorState message={statsResult.error ?? productsResult.error ?? "Admin query failed."} />
      </AdminShell>
    );
  }

  const stats = statsResult.data;
  const lowStock = productsResult.data.flatMap((product) =>
    (product.product_variants ?? [])
      .filter((variant) => (variant.inventory_quantity ?? 0) <= 10)
      .map((variant) => `${product.name} / ${variant.sku}`),
  );

  return (
    <AdminShell>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={stats.products} />
        <StatCard label="Variants" value={stats.variants} />
        <StatCard label="Inventory" value={stats.totalInventory} />
        <StatCard label="Marketplace Listings" value={stats.listings} />
        <StatCard label="Needs Review" value={stats.needsReview} />
        <StatCard label="Missing Stripe IDs" value={stats.missingStripeIds} />
        <StatCard label="Missing Amazon IDs" value={stats.missingAmazonIds} />
        <StatCard label="Missing TikTok IDs" value={stats.missingTikTokIds} />
        <StatCard label="Total Missing IDs" value={stats.missingIds} />
      </div>

      <AdminCard title="Marketplace Diagnostics" className="mt-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Stripe Active Variants
            </p>
            <p className="mt-3 text-2xl font-black text-white">
              {stats.connectedStripeVariants} / {stats.activeStripeVariants}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {stats.missingStripeIds} active variants missing Stripe IDs
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Amazon Listings
            </p>
            <p className="mt-3 text-2xl font-black text-white">
              {stats.connectedAmazonIds} connected
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {stats.missingAmazonIds} listings missing external IDs
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              TikTok Listings
            </p>
            <p className="mt-3 text-2xl font-black text-white">
              {stats.connectedTikTokIds} connected
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {stats.missingTikTokIds} listings missing external IDs
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Needs Review
            </p>
            <p className="mt-3 text-2xl font-black text-white">{stats.needsReview}</p>
            <p className="mt-1 text-sm text-gray-400">
              Listings flagged before sync work continues
            </p>
          </div>
        </div>
      </AdminCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminCard title="Quick Actions">
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-full border border-red-600/50 px-4 py-2 text-sm font-bold text-white hover:bg-red-600/10" href="/admin/products">
              Manage Products
            </Link>
            <Link className="rounded-full border border-red-600/50 px-4 py-2 text-sm font-bold text-white hover:bg-red-600/10" href="/admin/marketplace?missing=1">
              Fill Missing IDs
            </Link>
            <Link className="rounded-full border border-red-600/50 px-4 py-2 text-sm font-bold text-white hover:bg-red-600/10" href="/admin/inventory">
              Adjust Inventory
            </Link>
          </div>
        </AdminCard>

        <AdminCard title="Low Stock Watch">
          {lowStock.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-300">
              {lowStock.slice(0, 8).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No variants are at or below 10 units.</p>
          )}
        </AdminCard>
      </div>
    </AdminShell>
  );
}

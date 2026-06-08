import Link from "next/link";
import { redirect } from "next/navigation";
import { createMissingStripeMappingsAction } from "@/lib/admin/stripe-actions";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminSetupStatus } from "@/lib/admin/data";
import { getStripeSetupPlan } from "@/lib/admin/stripe";
import {
  AdminCard,
  AdminShell,
  ErrorState,
  SetupWarning,
  StatCard,
  SubmitButton,
} from "../components";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function statusClass(status: string) {
  if (status === "ready") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "needs_setup") {
    return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  }

  return "border-red-500/25 bg-red-500/10 text-red-200";
}

export default async function AdminStripePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const setup = getAdminSetupStatus();

  if (!setup.ready) {
    return <SetupWarning setup={setup} />;
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const params = await searchParams;
  const { data: plan, error } = await getStripeSetupPlan();

  if (error) {
    return (
      <AdminShell>
        <ErrorState message={error} />
      </AdminShell>
    );
  }

  const actionSummary = params?.processed
    ? [
        `${params.processed} variants processed`,
        `${params.productsCreated ?? 0} products created`,
        `${params.productsReused ?? 0} products reused`,
        `${params.pricesCreated ?? 0} prices created`,
        `${params.pricesReused ?? 0} prices reused`,
      ].join(" / ")
    : null;
  const canCreate = plan.stripeSecretConfigured && plan.readyCount < plan.variants.length;

  return (
    <AdminShell>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Stripe Ready" value={plan.readyCount} />
        <StatCard label="Missing" value={plan.missingCount} />
        <StatCard label="Needs Setup" value={plan.needsSetupCount} />
        <StatCard label="Active Variants" value={plan.variants.length} />
      </div>

      {actionSummary ? (
        <AdminCard title="Stripe Setup Complete" className="mt-6">
          <p className="text-sm font-semibold text-emerald-200">{actionSummary}</p>
        </AdminCard>
      ) : null}

      <AdminCard title="Stripe Automation" className="mt-6">
        <div className="grid gap-5 text-sm leading-6 text-gray-300 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p>
              This page is dry-run first. It shows exactly which Stripe Products
              and Prices would be created or reused for active Supabase variants.
              It does not create checkout sessions, charge customers, touch
              inventory, or modify Amazon/TikTok mappings.
            </p>
            {!plan.stripeSecretConfigured ? (
              <p className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-amber-100">
                STRIPE_SECRET_KEY is missing on the server, so creation is disabled.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/sync"
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white hover:border-red-600/60"
            >
              View Sync
            </Link>
            {canCreate ? (
              <form action={createMissingStripeMappingsAction}>
                <SubmitButton>Create Missing Stripe Products/Prices</SubmitButton>
              </form>
            ) : (
              <button
                type="button"
                disabled
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/45"
              >
                {plan.stripeSecretConfigured ? "Stripe Ready" : "Setup Disabled"}
              </button>
            )}
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Dry-Run Plan" className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-gray-500">
              <tr>
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Variant</th>
                <th className="py-3 pr-4">SKU</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Stripe Product</th>
                <th className="py-3 pr-4">Stripe Price</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 text-gray-300">
              {plan.variants.map((variant) => (
                <tr key={variant.variantId} className="align-top">
                  <td className="py-4 pr-4">
                    <p className="font-bold text-white">{variant.productName}</p>
                    <p className="mt-1 text-xs text-gray-500">{variant.productSlug}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-white">{variant.variantName}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {[variant.size, variant.color].filter(Boolean).join(" / ") || "Default"}
                    </p>
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs">{variant.sku}</td>
                  <td className="py-4 pr-4">
                    {formatPrice(variant.priceCents, variant.currency)}
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs">
                    {variant.stripeProductId ?? "Will create/reuse"}
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs">
                    {variant.stripePriceId ?? "Will create/reuse"}
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusClass(variant.status)}`}>
                      {variant.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {plan.variants.map((variant) => (
          <AdminCard key={variant.variantId} title={`${variant.productName} / ${variant.sku}`}>
            <div className="space-y-4 text-sm leading-6 text-gray-300">
              <div className="rounded-xl border border-white/8 bg-black/35 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  Would Create/Re-use
                </p>
                <p className="mt-2 text-white">{variant.plannedStripeProductName}</p>
                <p className="mt-1">
                  Stripe Price: {formatPrice(variant.plannedStripePriceAmount, variant.currency)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Metadata: SKU, Supabase product ID, Supabase variant ID, size, and color.
                </p>
              </div>
              {variant.plannedActions.length > 0 ? (
                <ul className="space-y-2">
                  {variant.plannedActions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-emerald-300">No action needed.</p>
              )}
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}

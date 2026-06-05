import Link from "next/link";
import { redirect } from "next/navigation";
import { updateMarketplaceListingAction } from "@/lib/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  getAdminMarketplaceListings,
  getAdminSetupStatus,
} from "@/lib/admin/data";
import {
  AdminCard,
  AdminShell,
  ErrorState,
  SelectField,
  SetupWarning,
  SubmitButton,
  TextAreaField,
  TextField,
} from "../components";

const channels = ["all", "website", "stripe", "amazon", "tiktok_shop"];
const statuses = [
  "all",
  "not_connected",
  "draft",
  "connected",
  "needs_review",
  "synced",
  "error",
];

export default async function AdminMarketplacePage({
  searchParams,
}: {
  searchParams?: Promise<{
    channel?: string;
    sync_status?: string;
    missing?: string;
  }>;
}) {
  const setup = getAdminSetupStatus();

  if (!setup.ready) {
    return <SetupWarning setup={setup} />;
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const filters = await searchParams;
  const channel = filters?.channel ?? "all";
  const syncStatus = filters?.sync_status ?? "all";
  const missingOnly = filters?.missing === "1";
  const { data: listings, error } = await getAdminMarketplaceListings();

  if (error) {
    return (
      <AdminShell>
        <ErrorState message={error} />
      </AdminShell>
    );
  }

  const filteredListings = listings.filter((listing) => {
    if (channel !== "all" && listing.channel !== channel) {
      return false;
    }

    if (syncStatus !== "all" && listing.sync_status !== syncStatus) {
      return false;
    }

    if (
      missingOnly &&
      listing.channel !== "website" &&
      listing.external_product_id &&
      listing.external_listing_id
    ) {
      return false;
    }

    return true;
  });

  return (
    <AdminShell>
      <AdminCard title="Marketplace Filters">
        <form className="grid gap-4 md:grid-cols-4">
          <SelectField label="Channel" name="channel" defaultValue={channel} options={channels} />
          <SelectField
            label="Sync Status"
            name="sync_status"
            defaultValue={syncStatus}
            options={statuses}
          />
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white md:mt-6">
            <input
              name="missing"
              value="1"
              type="checkbox"
              defaultChecked={missingOnly}
              className="h-4 w-4 accent-red-600"
            />
            Missing external IDs
          </label>
          <div className="md:mt-6">
            <SubmitButton>Apply Filters</SubmitButton>
          </div>
        </form>
        <Link
          href="/admin/marketplace"
          className="mt-4 inline-flex text-sm font-semibold text-red-400 hover:text-red-300"
        >
          Clear filters
        </Link>
      </AdminCard>

      <div className="mt-6 space-y-5">
        {filteredListings.map((listing) => (
          <AdminCard
            key={listing.id}
            title={`${listing.product_name} / ${listing.variant_sku ?? "product"} / ${listing.channel}`}
          >
            <div className="mb-4 flex flex-wrap gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em]">
              {listing.channel === "stripe" && !listing.external_product_id ? (
                <span className="rounded-full border border-red-500/30 px-2 py-1 text-red-300">
                  Missing Stripe Product ID
                </span>
              ) : null}
              {listing.channel === "stripe" && !listing.external_listing_id ? (
                <span className="rounded-full border border-red-500/30 px-2 py-1 text-red-300">
                  Missing Stripe Price ID
                </span>
              ) : null}
              {listing.channel === "amazon" && !listing.external_listing_id ? (
                <span className="rounded-full border border-amber-400/30 px-2 py-1 text-amber-300">
                  Missing Amazon Listing ID
                </span>
              ) : null}
              {listing.channel === "tiktok_shop" && !listing.external_listing_id ? (
                <span className="rounded-full border border-amber-400/30 px-2 py-1 text-amber-300">
                  Missing TikTok Shop Listing ID
                </span>
              ) : null}
              {listing.sync_status === "needs_review" ? (
                <span className="rounded-full border border-amber-400/30 px-2 py-1 text-amber-300">
                  Needs review
                </span>
              ) : null}
            </div>
            <form action={updateMarketplaceListingAction} className="grid gap-4 md:grid-cols-3">
              <input type="hidden" name="listing_id" value={listing.id} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  Product
                </p>
                <p className="mt-2 text-sm text-white">{listing.product_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  Variant
                </p>
                <p className="mt-2 text-sm text-white">
                  {listing.variant_name ?? "Product-level listing"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  Channel
                </p>
                <p className="mt-2 text-sm text-white">{listing.channel}</p>
              </div>
              <TextField
                label="External Product ID"
                name="external_product_id"
                defaultValue={listing.external_product_id}
              />
              <TextField
                label="External Listing ID"
                name="external_listing_id"
                defaultValue={listing.external_listing_id}
              />
              <TextField
                label="External SKU"
                name="external_sku"
                defaultValue={listing.external_sku}
              />
              <TextField
                label="Listing URL"
                name="listing_url"
                defaultValue={listing.listing_url}
              />
              <SelectField
                label="Sync Status"
                name="sync_status"
                defaultValue={listing.sync_status}
                options={statuses.filter((status) => status !== "all")}
              />
              <TextField
                label="Last Synced At"
                name="last_synced_at"
                defaultValue={listing.last_synced_at}
              />
              <TextAreaField label="Notes" name="notes" defaultValue={listing.notes} />
              <div className="md:col-span-3">
                <SubmitButton>Save Listing</SubmitButton>
              </div>
            </form>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}

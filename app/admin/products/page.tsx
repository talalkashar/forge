import Link from "next/link";
import { redirect } from "next/navigation";
import { createProductAction } from "@/lib/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminProducts, getAdminSetupStatus } from "@/lib/admin/data";
import {
  AdminCard,
  AdminShell,
  CheckboxField,
  ErrorState,
  SelectField,
  SetupWarning,
  SubmitButton,
  TextAreaField,
  TextField,
} from "../components";

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminProductsPage() {
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

  return (
    <AdminShell>
      <AdminCard title="Products">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.18em] text-gray-500">
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Slug</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Base Price</th>
                <th className="px-3 py-3">Featured</th>
                <th className="px-3 py-3">Sort</th>
                <th className="px-3 py-3">Variants</th>
                <th className="px-3 py-3">Inventory</th>
                <th className="px-3 py-3">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {products.map((product) => {
                const variants = product.product_variants ?? [];
                const totalInventory = variants.reduce(
                  (total, variant) => total + (variant.inventory_quantity ?? 0),
                  0,
                );
                const missingStripeCount = variants.filter(
                  (variant) => !variant.stripe_price_id || !variant.stripe_product_id,
                ).length;
                const hasImages = Boolean(product.product_images?.length);

                return (
                  <tr key={product.id} className="text-gray-300">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-white">{product.name}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em]">
                        {!hasImages ? (
                          <span className="rounded-full border border-amber-400/30 px-2 py-1 text-amber-300">
                            No image
                          </span>
                        ) : null}
                        {missingStripeCount > 0 ? (
                          <span className="rounded-full border border-red-500/30 px-2 py-1 text-red-300">
                            Missing Stripe IDs
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-4">{product.slug}</td>
                    <td className="px-3 py-4">{product.category}</td>
                    <td className="px-3 py-4">{product.status}</td>
                    <td className="px-3 py-4">{dollars(product.base_price_cents)}</td>
                    <td className="px-3 py-4">{product.is_featured ? "Yes" : "No"}</td>
                    <td className="px-3 py-4">{product.sort_order ?? 0}</td>
                    <td className="px-3 py-4">{variants.length}</td>
                    <td className="px-3 py-4">{totalInventory}</td>
                    <td className="px-3 py-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-bold text-red-400 hover:text-red-300"
                      >
                        Quick edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard title="Create Product" className="mt-6">
        <form action={createProductAction} className="grid gap-4 md:grid-cols-2">
          <TextField label="Name" name="name" required />
          <TextField label="Slug" name="slug" required />
          <TextField label="Subtitle" name="subtitle" />
          <TextField label="Category" name="category" defaultValue="belt" required />
          <SelectField
            label="Status"
            name="status"
            defaultValue="draft"
            options={["active", "draft", "archived"]}
          />
          <TextField
            label="Base Price Cents"
            name="base_price_cents"
            type="number"
            defaultValue={7997}
            required
          />
          <TextField label="Currency" name="currency" defaultValue="USD" required />
          <TextField label="Brand" name="brand" defaultValue="FORGE" />
          <TextField label="Sort Order" name="sort_order" type="number" defaultValue={0} />
          <CheckboxField label="Featured" name="is_featured" />
          <TextAreaField label="Description" name="description" />
          <div className="md:col-span-2">
            <SubmitButton>Create Product</SubmitButton>
          </div>
        </form>
      </AdminCard>
    </AdminShell>
  );
}

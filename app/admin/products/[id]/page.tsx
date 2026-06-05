import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createVariantAction,
  updateProductAction,
  updateVariantAction,
} from "@/lib/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminProductById, getAdminSetupStatus } from "@/lib/admin/data";
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
} from "../../components";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const setup = getAdminSetupStatus();

  if (!setup.ready) {
    return <SetupWarning setup={setup} />;
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const { id } = await params;
  const { data: product, error } = await getAdminProductById(id);

  if (error || !product) {
    return (
      <AdminShell>
        <ErrorState message={error ?? "Product not found."} />
      </AdminShell>
    );
  }

  const variants = product.product_variants ?? [];
  const imageCount = product.product_images?.length ?? 0;
  const missingStripeCount = variants.filter(
    (variant) => !variant.stripe_price_id || !variant.stripe_product_id,
  ).length;

  return (
    <AdminShell>
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm font-bold text-red-400 hover:text-red-300">
          Back to products
        </Link>
      </div>

      <AdminCard title="Catalog Warnings">
        <div className="grid gap-3 text-sm text-gray-300 md:grid-cols-3">
          <p>{imageCount > 0 ? `${imageCount} images mapped` : "No image mapped"}</p>
          <p>
            {missingStripeCount > 0
              ? `${missingStripeCount} variants missing Stripe IDs`
              : "Stripe IDs are filled for all variants"}
          </p>
          <p>
            {variants.some((variant) => (variant.inventory_quantity ?? 0) <= 0)
              ? "One or more variants have no inventory set"
              : "Inventory is set for all variants"}
          </p>
        </div>
      </AdminCard>

      <AdminCard title={`Edit ${product.name}`} className="mt-6">
        <form action={updateProductAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="product_id" value={product.id} />
          <TextField label="Name" name="name" defaultValue={product.name} required />
          <TextField label="Slug" name="slug" defaultValue={product.slug} required />
          <TextField label="Subtitle" name="subtitle" defaultValue={product.subtitle} />
          <TextField label="Category" name="category" defaultValue={product.category} required />
          <SelectField
            label="Status"
            name="status"
            defaultValue={product.status}
            options={["active", "draft", "archived"]}
          />
          <TextField
            label="Base Price Cents"
            name="base_price_cents"
            type="number"
            defaultValue={product.base_price_cents}
            required
          />
          <TextField label="Currency" name="currency" defaultValue={product.currency} required />
          <TextField label="Brand" name="brand" defaultValue={product.brand ?? "FORGE"} />
          <TextField
            label="Sort Order"
            name="sort_order"
            type="number"
            defaultValue={product.sort_order ?? 0}
          />
          <CheckboxField
            label="Featured"
            name="is_featured"
            defaultChecked={product.is_featured}
          />
          <TextAreaField
            label="Description"
            name="description"
            defaultValue={product.description}
          />
          <div className="md:col-span-2">
            <SubmitButton>Save Product</SubmitButton>
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Variants" className="mt-6">
        <div className="space-y-5">
          {variants.map((variant) => (
            <form
              key={variant.id}
              action={updateVariantAction}
              className="grid gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 md:grid-cols-3"
            >
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="variant_id" value={variant.id} />
              <TextField label="SKU" name="sku" defaultValue={variant.sku} required />
              <TextField label="Name" name="name" defaultValue={variant.name} required />
              <TextField label="Size" name="size" defaultValue={variant.size} />
              <TextField label="Color" name="color" defaultValue={variant.color} />
              <TextField
                label="Price Cents"
                name="price_cents"
                type="number"
                defaultValue={variant.price_cents ?? product.base_price_cents}
              />
              <TextField
                label="Inventory"
                name="inventory_quantity"
                type="number"
                defaultValue={variant.inventory_quantity ?? 0}
              />
              <TextField
                label="Stripe Price ID"
                name="stripe_price_id"
                defaultValue={variant.stripe_price_id}
              />
              <TextField
                label="Stripe Product ID"
                name="stripe_product_id"
                defaultValue={variant.stripe_product_id}
              />
              <CheckboxField
                label="Active"
                name="is_active"
                defaultChecked={variant.is_active}
              />
              <div className="md:col-span-3">
                <SubmitButton>Save Variant</SubmitButton>
              </div>
            </form>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Add Variant" className="mt-6">
        <form action={createVariantAction} className="grid gap-4 md:grid-cols-3">
          <input type="hidden" name="product_id" value={product.id} />
          <TextField label="SKU" name="sku" required />
          <TextField label="Name" name="name" required />
          <TextField label="Size" name="size" />
          <TextField label="Color" name="color" />
          <TextField
            label="Price Cents"
            name="price_cents"
            type="number"
            defaultValue={product.base_price_cents}
          />
          <TextField
            label="Inventory"
            name="inventory_quantity"
            type="number"
            defaultValue={0}
          />
          <TextField label="Stripe Price ID" name="stripe_price_id" />
          <TextField label="Stripe Product ID" name="stripe_product_id" />
          <CheckboxField label="Active" name="is_active" defaultChecked />
          <div className="md:col-span-3">
            <SubmitButton>Add Variant</SubmitButton>
          </div>
        </form>
      </AdminCard>
    </AdminShell>
  );
}

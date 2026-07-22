import { getStorefrontProducts } from "@/lib/products";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "../home/Footer";
import Navbar from "../home/Navbar";
import ProductCollectionState from "./ProductCollectionState";
import ShopCatalogResults from "./ShopCatalogResults";

type CatalogCategory = "belts" | "straps";

type ShopCatalogPageProps = {
  category?: string;
};

const catalogCategoryDetails: Record<
  CatalogCategory,
  {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  belts: {
    id: "lever-belts",
    eyebrow: "Belts",
    title: "Lever Belts",
    description: "10mm, 4-inch lever belts built for bracing under load.",
  },
  straps: {
    id: "wrist-straps",
    eyebrow: "Straps",
    title: "Wrist Straps",
    description: "Padded grip support for deadlifts, rows, and pull work.",
  },
};

function normalizeCatalogCategory(category?: string): CatalogCategory | undefined {
  return category === "belts" || category === "straps" ? category : undefined;
}

export default async function ShopCatalogPage({ category }: ShopCatalogPageProps) {
  const { data: products, error, missingEnv } = await getStorefrontProducts();
  const activeCategory = normalizeCatalogCategory(category);
  const leverBelts = products.filter((product) => product.catalogCategory === "belts");
  const wristStraps = products.filter((product) => product.catalogCategory === "straps");
  const allProductSections = [
    {
      ...catalogCategoryDetails.belts,
      products: leverBelts,
    },
    {
      ...catalogCategoryDetails.straps,
      products: wristStraps,
    },
  ];
  const productSections = activeCategory
    ? allProductSections.filter(
        (section) => section.id === catalogCategoryDetails[activeCategory].id,
      )
    : allProductSections;
  const heroTitle = activeCategory
    ? catalogCategoryDetails[activeCategory].title
    : "All gear";
  const heroDescription = activeCategory
    ? catalogCategoryDetails[activeCategory].description
    : "Belts for bracing. Straps for grip.";
  const breadcrumbPage = activeCategory
    ? catalogCategoryDetails[activeCategory].title
    : "Shop";

  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-14 sm:px-8 sm:py-20">
          <div
            className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-red-700/15 blur-[90px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl">
            <Breadcrumb className="mb-8">
              <BreadcrumbList className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/70">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="text-white transition-opacity hover:opacity-80"
                    href="/"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{breadcrumbPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-red-500" aria-hidden="true" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-red-500">
                Shop
              </p>
              <span className="h-px w-10 bg-red-500" aria-hidden="true" />
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.92] tracking-[-0.04em] text-white sm:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/90">
              {heroDescription}
            </p>

            {!activeCategory ? (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop/belts"
                  className="rounded-full bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-500"
                >
                  Belts
                </Link>
                <Link
                  href="/shop/wrist-straps"
                  className="rounded-full border border-white/25 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-white/50"
                >
                  Straps
                </Link>
              </div>
            ) : (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="text-xs font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
                >
                  ← All gear
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="px-6 py-12 sm:px-8 sm:py-16">
          {missingEnv || error || products.length === 0 ? (
            <div className="mx-auto max-w-7xl">
              <ProductCollectionState
                eyebrow="Shop"
                title={
                  products.length === 0 && !error && !missingEnv
                    ? "No products in this filter yet"
                    : "Catalog is loading. Try refresh."
                }
                message="Please check back soon for the latest FORGE GYM belts and wrist straps."
              />
            </div>
          ) : (
            <ShopCatalogResults
              sections={productSections.filter((section) => section.products.length > 0)}
              showSearch={!activeCategory}
              category={activeCategory}
            />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

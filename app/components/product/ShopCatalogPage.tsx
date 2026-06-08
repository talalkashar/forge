import { getStorefrontProducts } from "@/lib/products";
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
    eyebrow: "Lever Belts",
    title: "Lever Belts",
    description:
      "Premium lever belts built for bracing hard, moving heavy, and staying locked in under load.",
  },
  straps: {
    id: "wrist-straps",
    eyebrow: "Wrist Straps",
    title: "Wrist Straps",
    description:
      "Grip support for heavy pulls, rows, and high-volume back training when your hands need to stay locked in.",
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
    : "All FORGE Products";
  const heroDescription = activeCategory
    ? catalogCategoryDetails[activeCategory].description
    : "Browse the current FORGE lineup. Every product card links directly to a dedicated detail page so sizing, specs, and checkout stay clear and consistent.";
  const breadcrumbPage = activeCategory
    ? catalogCategoryDetails[activeCategory].title
    : "All Gear";

  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-red-600/10 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_38%),linear-gradient(180deg,#090909_0%,#000000_100%)] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <Breadcrumb className="mb-8">
              <BreadcrumbList className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                <BreadcrumbItem>
                  <BreadcrumbLink className="hover:text-white" href="/">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-red-500/70" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{breadcrumbPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
              Shop
            </p>
            <h1 className="max-w-4xl text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl md:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              {heroDescription}
            </p>
          </div>
        </section>

        <section className="px-6 py-14 sm:px-8 sm:py-18">
          {missingEnv ? (
            <div className="mx-auto max-w-7xl">
              <ProductCollectionState
                eyebrow="Shop"
                title="Products are temporarily unavailable"
                message="Please check back soon for the latest FORGE belts and wrist straps."
              />
            </div>
          ) : error ? (
            <div className="mx-auto max-w-7xl">
              <ProductCollectionState
                eyebrow="Shop"
                title="Products are temporarily unavailable"
                message="Please check back soon for the latest FORGE belts and wrist straps."
              />
            </div>
          ) : products.length > 0 ? (
            <ShopCatalogResults
              sections={productSections.filter((section) => section.products.length > 0)}
              showSearch={!activeCategory}
            />
          ) : (
            <div className="mx-auto max-w-7xl">
              <ProductCollectionState
                eyebrow="Shop"
                title="Gear is coming soon"
                message="Please check back soon for the latest FORGE belts and wrist straps."
              />
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

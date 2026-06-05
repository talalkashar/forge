import { getStorefrontProducts } from "@/lib/products";
import Footer from "../home/Footer";
import Navbar from "../home/Navbar";
import ProductCollectionState from "./ProductCollectionState";
import ProductCard from "./ProductCard";

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
  const leverBelts = products.filter((product) =>
    product.href.includes("/product/belt") ||
    product.category.toLowerCase().includes("belt"),
  );
  const wristStraps = products.filter((product) =>
    product.slug.includes("strap") ||
    product.href.includes("/product/straps") ||
    product.name.toLowerCase().includes("strap"),
  );
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

  return (
    <>
      <Navbar />
      <div className="h-16 sm:h-20" />
      <main className="bg-black">
        <section className="border-b border-red-600/10 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_38%),linear-gradient(180deg,#090909_0%,#000000_100%)] px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
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
                eyebrow="Catalog Offline"
                title="Supabase configuration is missing"
                message="Add the Supabase environment variables to render live storefront products here."
              />
            </div>
          ) : error ? (
            <div className="mx-auto max-w-7xl">
              <ProductCollectionState
                eyebrow="Catalog Error"
                title="Could not load products"
                message={error}
              />
            </div>
          ) : products.length > 0 ? (
            <div className="mx-auto max-w-7xl space-y-14">
              {productSections
                .filter((section) => section.products.length > 0)
                .map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-red-500/90">
                          {section.eyebrow}
                        </p>
                        <h2 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                          {section.title}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                          {section.description}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-white/55">
                        {section.products.length}{" "}
                        {section.products.length === 1 ? "product" : "products"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      {section.products.map((product) => (
                        <ProductCard key={product.slug} product={product} />
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          ) : (
            <div className="mx-auto max-w-7xl">
              <ProductCollectionState
                eyebrow="Catalog Empty"
                title="No live products found"
                message="Supabase is connected, but the products table does not currently expose any storefront items."
              />
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

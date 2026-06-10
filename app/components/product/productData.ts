export type DescriptionSection = {
  title: string;
  images: string[];
  text: string;
};

export type SpecificationGroup = {
  title: string;
  rows?: Array<[string, string]>;
  bullets?: string[];
  mono?: boolean;
};

export type Review = {
  name: string;
  rating: 4 | 5;
  date: string;
  text: string;
};

export type ProductDetailConfig = {
  id: string | number;
  slug: string;
  name: string;
  cartName: string;
  price: number;
  originalPrice?: string;
  kicker: string;
  images: string[];
  imageAlts?: string[];
  featureList: string[];
  intro: string;
  descriptionSections: DescriptionSection[];
  descriptionGalleryImages?: string[];
  specificationGroups: SpecificationGroup[];
  reviews: Review[];
  buyNowUrl: string;
  href: string;
};

export type ProductCatalogItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: string;
  href: string;
  images: string[];
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
};

export type ProductPresentation = {
  slug: string;
  href: string;
  images: string[];
  description: string;
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  originalPrice?: string;
  kicker: string;
  imageAlts?: string[];
  featureList: string[];
  intro: string;
  descriptionSections: DescriptionSection[];
  descriptionGalleryImages?: string[];
  specificationGroups: SpecificationGroup[];
  reviews: Review[];
  buyNowUrl: string;
};

const strapProductImages = [
  "/images/straps/listing/1-removebg.webp",
  "/images/straps/listing/2.webp",
  "/images/straps/listing/3.webp",
  "/images/straps/listing/4.webp",
  "/images/straps/listing/5.webp",
  "/images/straps/listing/6.webp",
  "/images/straps/lifestyle/forge-straps-gym-mat.jpg",
  "/images/straps/lifestyle/forge-straps-bar-hold.jpg",
];

const strapProductImageAlts = [
  "FORGE lifting straps product cutout on a dark storefront background.",
  "FORGE lifting straps product view 2.",
  "FORGE lifting straps product view 3.",
  "FORGE lifting straps product view 4.",
  "FORGE lifting straps product view 5.",
  "FORGE lifting straps product view 6.",
  "FORGE wrist straps laid out on a gym mat beside a loaded barbell.",
  "FORGE wrist straps worn while holding a loaded barbell.",
];

const zeusBeltImages = [
  "/images/belts/listing/zeus/1.webp",
  "/images/belts/listing/zeus/2.webp",
  "/images/belts/listing/zeus/3.webp",
  "/images/belts/listing/zeus/4.webp",
  "/images/belts/listing/zeus/5.webp",
  "/images/belts/listing/zeus/6.webp",
  "/images/belts/lifestyle/zeus-belt-worn-front.jpeg",
  "/images/belts/lifestyle/zeus-belt-lift-angle.jpeg",
];

const zeusBeltImageAlts = [
  "FORGE Zeus lever belt product view with black and red finish.",
  "FORGE Zeus lever belt detail view 2.",
  "FORGE Zeus lever belt detail view 3.",
  "FORGE Zeus lever belt detail view 4.",
  "FORGE Zeus lever belt detail view 5.",
  "FORGE Zeus lever belt detail view 6.",
  "FORGE Zeus lever belt worn at the waist with the lever buckle visible.",
  "FORGE Zeus lever belt worn during a lift setup with the lever buckle visible.",
];

const berserkLifestyleImages = [
  "/images/belts/lifestyle/berserk-belt-deadlift.jpeg",
  "/images/belts/lifestyle/berserk-belt-front-detail.jpeg",
  "/images/belts/lifestyle/berserk-belt-bench-detail.jpeg",
];

const berserkBeltImages = [
  "/images/belts/lifestyle/berserk-belt-bench-detail.jpeg",
  "/images/belts/listing/berserk/1.webp",
  "/images/belts/listing/berserk/2.webp",
  "/images/belts/listing/berserk/3.webp",
  "/images/belts/listing/berserk/4.webp",
  "/images/belts/listing/berserk/5.webp",
  "/images/belts/listing/berserk/6.webp",
  "/images/belts/listing/berserk/7.webp",
  ...berserkLifestyleImages.filter(
    (image) => !image.includes("bench-detail"),
  ),
];

const berserkBeltImageAlts = [
  "FORGE Berserk lever belt resting on a bench with dark gym lighting.",
  "FORGE Berserk lever belt product view 1.",
  "FORGE Berserk lever belt product view 2.",
  "FORGE Berserk lever belt product view 3.",
  "FORGE Berserk lever belt product view 4.",
  "FORGE Berserk lever belt product view 5.",
  "FORGE Berserk lever belt product view 6.",
  "FORGE Berserk lever belt product view 7.",
  "FORGE Berserk lever belt worn during a deadlift setup in the gym.",
  "FORGE Berserk lever belt front detail with artwork and red interior.",
];

const blackBeltImages = [
  "/images/belts/listing/Black Lever Belt/1.webp",
  "/images/belts/listing/Black Lever Belt/2.webp",
  "/images/belts/listing/Black Lever Belt/3.webp",
  "/images/belts/listing/Black Lever Belt/4.webp",
];

const blackBeltImageAlts = [
  "FORGE black lever belt product view 1.",
  "FORGE black lever belt product view 2.",
  "FORGE black lever belt product view 3.",
  "FORGE black lever belt product view 4.",
];

const blackBerserkDescriptionImages = [
  "/images/belts/product description/Black&Berserk Product description/1.webp",
  "/images/belts/product description/Black&Berserk Product description/2.webp",
  "/images/belts/product description/Black&Berserk Product description/3.webp",
  "/images/belts/product description/Black&Berserk Product description/4.webp",
  "/images/belts/product description/Black&Berserk Product description/5.webp",
];

const strapDescriptionGalleryImages = [
  "/images/straps/product description/22.webp",
  "/images/straps/product description/33.webp",
  "/images/straps/product description/44.webp",
  "/images/straps/product description/55.webp",
  "/images/straps/product description/66.webp",
  "/images/straps/product description/77.webp",
];

const beltBaseSpecificationGroups: SpecificationGroup[] = [
  {
    title: "Product Information",
    rows: [
      ["Brand:", "FORGE GYM"],
      ["Category:", "Lever Belt"],
      ["Variants:", "Zeus, Berserk, Black"],
      ["Closure:", "Lever"],
      ["Thickness:", "10mm"],
      ["Width:", "4 inches"],
    ],
  },
  {
    title: "Use Case",
    bullets: [
      "Heavy squats and deadlifts",
      "Powerlifting and strength training",
      "Fast on-off lever adjustment",
      "One lever belt included",
    ],
  },
  {
    title: "Construction",
    rows: [
      ["Material:", "Structured belt build"],
      ["Support:", "Rigid core bracing"],
      ["Stitching:", "Double stitching"],
      ["Buckle:", "Durable lever buckle"],
    ],
  },
  {
    title: "Care",
    bullets: [
      "Wipe clean after training",
      "Keep dry between sessions",
      "Avoid dropping the lever buckle on hard surfaces",
    ],
  },
];

const beltBasePresentation = {
  originalPrice: "$85",
  kicker: "Lifting Gear",
  featureList: [
    "Secure lever closure for fast adjustments",
    "Rigid support for heavy strength work",
    "10mm thickness with a 4-inch belt width",
    "Three variant options within one product line",
  ],
  intro:
    "Built to lock in your core under heavy weight. The FORGE Lever Belt delivers support, speed, and a clean finish across every variant.",
  descriptionSections: [
    {
      title: "1. Locked-In Support:",
      images: ["/images/belts/listing/zeus/1.webp"],
      text: "The FORGE lever system is built for fast setup and dependable bracing, giving you the stability needed for squats, deadlifts, and heavy compound work.",
    },
    {
      title: "2. Premium Structure:",
      images: ["/images/belts/listing/berserk/4.webp"],
      text: "A rigid belt profile creates a consistent, supportive feel around your core so every rep feels more secure under load.",
    },
    {
      title: "3. Variant Flexibility:",
      images: ["/images/belts/listing/berserk/7.webp"],
      text: "Choose between Zeus, Berserk, and Black variants while staying within the same FORGE belt platform and product fit.",
    },
  ],
  specificationGroups: beltBaseSpecificationGroups,
  reviews: [],
  buyNowUrl: "/cart",
};

export const beltVariantOrder = ["zeus", "berserk", "black"] as const;
export type BeltProductSlug = (typeof beltVariantOrder)[number];

export const featuredProductOrder = ["zeus", "berserk", "straps"] as const;

export const beltDescriptionGalleryBySlug: Record<BeltProductSlug, string[]> = {
  zeus: [
    "/product-description/zeus/1.png",
    "/product-description/zeus/2.png",
    "/product-description/zeus/3.png",
  ],
  berserk: blackBerserkDescriptionImages,
  black: blackBerserkDescriptionImages,
};

export const productPresentationBySlug: Record<string, ProductPresentation> = {
  zeus: {
    slug: "zeus",
    href: "/product/belt?variant=zeus",
    images: zeusBeltImages,
    description:
      "A rigid FORGE lever belt built for aggressive bracing, fast setup, and heavy lower-body training sessions.",
    categoryLabel: "Lifting Belt",
    rating: 0,
    reviewCount: 0,
    descriptionGalleryImages: beltDescriptionGalleryBySlug.zeus,
    ...beltBasePresentation,
    imageAlts: zeusBeltImageAlts,
  },
  berserk: {
    slug: "berserk",
    href: "/product/belt?variant=berserk",
    images: berserkBeltImages,
    description:
      "The Berserk variant keeps the same FORGE belt platform with a bold finish and locked-in support for compound lifts.",
    categoryLabel: "Lifting Belt",
    rating: 0,
    reviewCount: 0,
    descriptionGalleryImages: beltDescriptionGalleryBySlug.berserk,
    ...beltBasePresentation,
    imageAlts: berserkBeltImageAlts,
  },
  black: {
    slug: "black",
    href: "/product/belt?variant=black",
    images: blackBeltImages,
    description:
      "A stealth black FORGE lever belt with the same rigid platform, fast lever closure, and heavy-duty support.",
    categoryLabel: "Lifting Belt",
    rating: 0,
    reviewCount: 0,
    descriptionGalleryImages: beltDescriptionGalleryBySlug.black,
    ...beltBasePresentation,
    imageAlts: blackBeltImageAlts,
  },
  straps: {
    slug: "straps",
    href: "/product/straps",
    images: strapProductImages,
    description:
      "Cotton-blend lifting straps with a secure wrap and padded wrist support for heavy pulls and higher-volume back work.",
    categoryLabel: "Accessories",
    rating: 0,
    reviewCount: 0,
    originalPrice: "$19.99",
    kicker: "Lifting Gear",
    imageAlts: strapProductImageAlts,
    featureList: [
      "Non-slip grip material for stronger holds",
      "Comfortable wrist padding for heavy sessions",
      "Adjustable wrap for secure fit",
      "Built for deadlifts, rows, and pull-ups",
    ],
    intro:
      "Max out your lifts with comfort and control. Built for heavy pulling days and forged for discipline.",
    descriptionGalleryImages: strapDescriptionGalleryImages,
    descriptionSections: [
      {
        title: "1. Unbreakable Strength:",
        images: ["/images/straps/product description/22.webp"],
        text: "Push beyond limits with wrist straps built to endure your toughest sessions. Crafted from high-grade cotton and reinforced stitching, these straps support your grip so you can lift heavier and train harder without slipping or tearing.",
      },
      {
        title: "2. Superior Grip:",
        images: ["/images/straps/product description/33.webp"],
        text: "Stay locked in even when the sweat hits. The non-slip textured surface ensures the bar stays secure in your hands, giving you full confidence in every rep. Designed to adjust smoothly for a secure and comfortable fit.",
      },
      {
        title: "3. Total Comfort:",
        images: ["/images/straps/product description/44.webp"],
        text: "Soft padded neoprene hugs your wrist and eliminates friction or discomfort. Built for long lifting sessions so your focus stays on performance, not pain.",
      },
      {
        title: "4. Adjustable Fit:",
        images: ["/images/straps/product description/55.webp"],
        text: "Designed to fit any wrist size or lifting style. Easy to wrap, quick to release, and always stable - comfort without compromise. Extended length and optimized width ensure secure grip performance.",
      },
      {
        title: "5. Trusted Support:",
        images: [
          "/images/straps/product description/66.webp",
          "/images/straps/product description/77.webp",
        ],
        text: "Forge Gym straps reduce strain and fatigue during heavy lifts, helping you train smarter and recover faster. Non-slip webbing locks your grip securely, giving full control even with maximum weight.",
      },
    ],
    specificationGroups: [
      {
        title: "Product Information",
        rows: [
          ["Brand:", "FORGE GYM"],
          ["Manufacturer:", "Capacity Gears"],
          ["Color:", "Black"],
          ["Style:", "Modern"],
          ["Number of Items:", "2 (One Pair)"],
        ],
      },
      {
        title: "Dimensions & Materials",
        rows: [
          ["Length:", "20.8 inches (53 cm)"],
          ["Width:", "1.6 inches (4 cm)"],
          ["Material:", "Cotton Blend + Neoprene"],
          ["Padding:", "Neoprene wrist cushioning"],
          ["Stitching:", "Reinforced high-grade"],
        ],
      },
      {
        title: "Features",
        bullets: [
          "Non-slip textured webbing",
          "Reinforced high-grade stitching",
          "Neoprene wrist cushioning",
        ],
      },
      {
        title: "Product Codes",
        rows: [
          ["UPC:", "199284264465"],
          ["ASIN:", "B0FN79GGQ9"],
        ],
        mono: true,
      },
    ],
    reviews: [],
    buyNowUrl:
      "https://www.amazon.com/dp/B0FN79GGQ9?tag=68326-forgexfit-20&linkCode=ogi&th=1&psc=1&ascsubtag=srctok-c64406ef1da9d8bb&btn_ref=srctok-c64406ef1da9d8bb",
  },
};

export const products: ProductCatalogItem[] = Object.values(productPresentationBySlug).map(
  (presentation) => {
    const isBelt = beltVariantOrder.includes(
      presentation.slug as (typeof beltVariantOrder)[number],
    );

    return {
      id: isBelt ? `belt-${presentation.slug}` : "wrist-straps",
      slug: presentation.slug,
      name:
        presentation.slug === "straps"
          ? "FORGE Lifting Straps"
          : `${presentation.slug.charAt(0).toUpperCase()}${presentation.slug.slice(1)} Lever Belt`,
      price: isBelt ? 79.97 : 9.99,
      originalPrice: presentation.originalPrice,
      href: presentation.href,
      images: presentation.images,
      description: presentation.description,
      category: presentation.categoryLabel,
      rating: presentation.rating,
      reviewCount: presentation.reviewCount,
    };
  },
);

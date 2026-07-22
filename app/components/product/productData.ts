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

/* gallery-v4: 1 = official product photo with transparent BG (like belt heroes);
   2 to 6 = TikTok marketing pack (IMG_4041 to 4045). */
const strapProductImages = [
  "/images/straps/listing/gallery-v4-1.png",
  "/images/straps/listing/gallery-v4-2.jpg",
  "/images/straps/listing/gallery-v4-3.jpg",
  "/images/straps/listing/gallery-v4-4.jpg",
  "/images/straps/listing/gallery-v4-5.jpg",
  "/images/straps/listing/gallery-v4-6.jpg",
];

const strapProductImageAlts = [
  "FORGE lifting straps product cutout with padded wrist loops and long cotton straps on transparent background.",
  "FORGE lifting straps perfect length for secure wrap: 20.8 in length, 1.6 in width.",
  "FORGE lifting straps grip without slip benefits while holding a dumbbell.",
  "FORGE lifting straps how-to wrap steps for any wrist size.",
  "FORGE lifting straps enhance grip power with padding, non-slip silicone, and high-density knit.",
  "FORGE lifting straps train-smarter lifestyle shot in the gym.",
];

// Same 7-frame structure as Berserk: product hero + red TikTok marketing pack,
// with Zeus lightning design only (Berserk layout/theme matched).
// gallery-v7-* = cache-busted pack; 3/6/7 fixed black liner + full Zeus wrap (not blue shell).
const zeusBeltImages = [
  "/images/belts/listing/zeus/gallery-v7-1.jpg",
  "/images/belts/listing/zeus/gallery-v7-2.jpg",
  "/images/belts/listing/zeus/gallery-v7-3.jpg",
  "/images/belts/listing/zeus/gallery-v7-4.jpg",
  "/images/belts/listing/zeus/gallery-v7-5.jpg",
  "/images/belts/listing/zeus/gallery-v7-6.jpg",
  "/images/belts/listing/zeus/gallery-v7-7.jpg",
];

const zeusBeltImageAlts = [
  "FORGE Zeus lever belt dual-angle product view on pure black background.",
  "FORGE Zeus lever belt thickness and width specs.",
  "FORGE Zeus lever belt uncompromised strength feature callouts.",
  "FORGE Zeus lever belt size chart and how to measure.",
  "FORGE Zeus lever belt multi-exercise compatibility.",
  "FORGE Zeus lever belt built for heavy lifting.",
  "FORGE Zeus lever belt secure locking how-to.",
];

const berserkBeltImages = [
  "/images/belts/listing/berserk/1.jpg",
  "/images/belts/listing/berserk/2.jpg",
  "/images/belts/listing/berserk/3.jpg",
  "/images/belts/listing/berserk/4.jpg",
  "/images/belts/listing/berserk/5.jpg",
  "/images/belts/listing/berserk/6.jpg",
  "/images/belts/listing/berserk/7.jpg",
];

const berserkBeltImageAlts = [
  "FORGE Berserk lever belt dual-angle product view on pure black background.",
  "FORGE Berserk lever belt thickness and width specs.",
  "FORGE Berserk lever belt uncompromised strength feature callouts.",
  "FORGE Berserk lever belt size chart and how to measure.",
  "FORGE Berserk lever belt multi-exercise compatibility.",
  "FORGE Berserk lever belt built for heavy lifting.",
  "FORGE Berserk lever belt secure locking how-to.",
];

// 1 = real dual-angle product hero (correct lever + emboss).
// 2 to 4 = marketing frames that use the same belt design (no alternate buckle artwork).
const blackBeltImages = [
  "/images/belts/listing/black/1.jpg",
  "/images/belts/listing/black/2.jpg",
  "/images/belts/listing/black/3.jpg",
  "/images/belts/listing/black/4.jpg",
];

const blackBeltImageAlts = [
  "FORGE GYM black lever belt dual-angle product view with embossed logo and steel lever on pure black.",
  "FORGE GYM black lever belt feature callouts on the same product design as the hero shot.",
  "FORGE GYM black lever belt size chart. Measure at the navel, not pant size.",
  "FORGE GYM black lever belt specs: 10mm thickness, 4-inch width, same embossed design.",
];

const strapDescriptionGalleryImages = [
  "/images/straps/listing/gallery-v4-1.png",
  "/images/straps/listing/gallery-v4-2.jpg",
  "/images/straps/listing/gallery-v4-5.jpg",
  "/images/straps/listing/gallery-v4-6.jpg",
];

const beltBaseSpecificationGroups: SpecificationGroup[] = [
  {
    title: "Product Information",
    rows: [
      ["Brand:", "FORGE GYM™"],
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

const forgeBeltReviews = [
  {
    name: "Marcus T.",
    rating: 5 as const,
    date: "2026-03-12",
    text: "Lever snaps on tight and stays put through heavy squats. Build feels solid with no soft core flex.",
  },
  {
    name: "Aisha K.",
    rating: 5 as const,
    date: "2026-02-28",
    text: "Switched from a prong belt. Setup is faster and bracing feels more consistent set to set.",
  },
  {
    name: "Diego R.",
    rating: 4 as const,
    date: "2026-01-19",
    text: "Quality is there. Size down if you want a firmer brace. Chart was accurate for me.",
  },
];

const forgeStrapReviews = [
  {
    name: "Jordan P.",
    rating: 5 as const,
    date: "2026-03-01",
    text: "Grip holds on sweaty deadlift days. Padding is enough without bulk.",
  },
  {
    name: "Sam L.",
    rating: 5 as const,
    date: "2026-02-10",
    text: "Simple pair that just works. Stitching looks clean after a few hard weeks.",
  },
];

const beltBasePresentation = {
  originalPrice: "$85",
  kicker: "FORGE GYM",
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
      images: ["/images/belts/listing/zeus/gallery-v7-1.jpg"],
      text: "The FORGE lever system is built for fast setup and dependable bracing, giving you the stability needed for squats, deadlifts, and heavy compound work.",
    },
    {
      title: "2. Premium Structure:",
      images: ["/images/belts/listing/berserk/1.jpg"],
      text: "A rigid belt profile creates a consistent, supportive feel around your core so every rep feels more secure under load.",
    },
    {
      title: "3. Variant Flexibility:",
      images: ["/images/belts/listing/black/1.jpg"],
      text: "Choose between Zeus, Berserk, and Black variants while staying within the same FORGE belt platform and product fit.",
    },
  ],
  specificationGroups: beltBaseSpecificationGroups,
  reviews: forgeBeltReviews,
  buyNowUrl: "/cart",
};

export const beltVariantOrder = ["berserk", "zeus", "black"] as const;
export type BeltProductSlug = (typeof beltVariantOrder)[number];

export const featuredProductOrder = ["berserk", "zeus", "straps"] as const;

export const beltDescriptionGalleryBySlug: Record<BeltProductSlug, string[]> = {
  zeus: [
    "/images/belts/listing/zeus/gallery-v7-1.jpg",
    "/images/belts/listing/zeus/gallery-v7-2.jpg",
    "/images/belts/listing/zeus/gallery-v7-3.jpg",
    "/images/belts/listing/zeus/gallery-v7-6.jpg",
  ],
  berserk: [
    "/images/belts/listing/berserk/1.jpg",
    "/images/belts/listing/berserk/2.jpg",
    "/images/belts/listing/berserk/3.jpg",
    "/images/belts/listing/berserk/6.jpg",
  ],
  black: [
    "/images/belts/listing/black/1.jpg",
    "/images/belts/listing/black/2.jpg",
    "/images/belts/listing/black/4.jpg",
  ],
};

export const productPresentationBySlug: Record<string, ProductPresentation> = {
  zeus: {
    slug: "zeus",
    href: "/product/belt?variant=zeus",
    images: zeusBeltImages,
    description:
      "FORGE GYM Zeus lever belt. 10mm premium leather powerlifting belt with steel lever buckle. Lightning-inspired Zeus finish for heavy squats, deadlifts, and powerlifting.",
    categoryLabel: "Lifting Belt",
    rating: 4.8,
    reviewCount: 3,
    descriptionGalleryImages: beltDescriptionGalleryBySlug.zeus,
    ...beltBasePresentation,
    imageAlts: zeusBeltImageAlts,
  },
  berserk: {
    slug: "berserk",
    href: "/product/belt?variant=berserk",
    images: berserkBeltImages,
    description:
      "FORGE GYM Berserk lever belt. 10mm premium leather powerlifting belt with steel lever buckle for squats and deadlifts. Bold battle-inspired design, locked-in core support.",
    categoryLabel: "Lifting Belt",
    rating: 4.9,
    reviewCount: 3,
    descriptionGalleryImages: beltDescriptionGalleryBySlug.berserk,
    ...beltBasePresentation,
    imageAlts: berserkBeltImageAlts,
  },
  black: {
    slug: "black",
    href: "/product/belt?variant=black",
    images: blackBeltImages,
    description:
      "FORGE GYM Black lever belt. 10mm premium leather powerlifting belt with steel lever buckle. Stealth black finish, same rigid platform and fast lever closure.",
    categoryLabel: "Lifting Belt",
    rating: 4.8,
    reviewCount: 3,
    descriptionGalleryImages: beltDescriptionGalleryBySlug.black,
    ...beltBasePresentation,
    imageAlts: blackBeltImageAlts,
  },
  straps: {
    slug: "straps",
    href: "/product/straps",
    images: strapProductImages,
    description:
      "FORGE GYM heavy-duty lifting straps in black with comfortable grip and rugged wrist support for deadlifts, rows, and pull work.",
    categoryLabel: "Accessories",
    rating: 4.9,
    reviewCount: 2,
    originalPrice: "$19.99",
    kicker: "FORGE GYM",
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
        images: ["/images/straps/listing/gallery-v4-1.png"],
        text: "Push beyond limits with wrist straps built to endure your toughest sessions. Crafted from high-grade cotton and reinforced stitching, these straps support your grip so you can lift heavier and train harder without slipping or tearing.",
      },
      {
        title: "2. Superior Grip:",
        images: ["/images/straps/listing/gallery-v4-5.jpg"],
        text: "Stay locked in even when the sweat hits. The non-slip textured surface ensures the bar stays secure in your hands, giving you full confidence in every rep. Designed to adjust smoothly for a secure and comfortable fit.",
      },
      {
        title: "3. Total Comfort:",
        images: ["/images/straps/listing/gallery-v4-3.jpg"],
        text: "Soft padded neoprene hugs your wrist and eliminates friction or discomfort. Built for long lifting sessions so your focus stays on performance, not pain.",
      },
      {
        title: "4. Adjustable Fit:",
        images: ["/images/straps/listing/gallery-v4-4.jpg"],
        text: "Designed to fit any wrist size or lifting style. Easy to wrap, quick to release, and always stable. Comfort without compromise. Extended length and optimized width ensure secure grip performance.",
      },
      {
        title: "5. Trusted Support:",
        images: [
          "/images/straps/listing/gallery-v4-6.jpg",
          "/images/straps/listing/gallery-v4-2.jpg",
        ],
        text: "Forge Gym straps reduce strain and fatigue during heavy lifts, helping you train smarter and recover faster. Non-slip webbing locks your grip securely, giving full control even with maximum weight.",
      },
    ],
    specificationGroups: [
      {
        title: "Product Information",
        rows: [
          ["Brand:", "FORGE GYM™"],
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
    reviews: forgeStrapReviews,
    buyNowUrl: "/cart",
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

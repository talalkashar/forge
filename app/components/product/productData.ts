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
  id: number;
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

const strapProductImages = [
  "/images/straps/listing/1-removebg.webp",
  "/images/straps/listing/2.webp",
  "/images/straps/listing/3.webp",
  "/images/straps/listing/4.webp",
  "/images/straps/listing/5.webp",
  "/images/straps/listing/6.webp",
];

const zeusBeltImages = [
  "/images/belts/listing/zeus/1.webp",
  "/images/belts/listing/zeus/2.webp",
  "/images/belts/listing/zeus/3.webp",
  "/images/belts/listing/zeus/4.webp",
  "/images/belts/listing/zeus/5.webp",
  "/images/belts/listing/zeus/6.webp",
];

const zeusBeltImageAlts = Array.from(
  { length: zeusBeltImages.length },
  (_, index) =>
    `FORGE Zeus lever belt with 10mm thickness, 4-inch width, double stitching, durable buckle, and core support. View ${index + 1}`,
);

const berserkBeltImages = [
  "/images/belts/listing/berserk/1.webp",
  "/images/belts/listing/berserk/2.webp",
  "/images/belts/listing/berserk/3.webp",
  "/images/belts/listing/berserk/4.webp",
  "/images/belts/listing/berserk/5.webp",
  "/images/belts/listing/berserk/6.webp",
  "/images/belts/listing/berserk/7.webp",
];

const blackBeltImages = [
  "/images/belts/listing/Black Lever Belt/1.webp",
  "/images/belts/listing/Black Lever Belt/2.webp",
  "/images/belts/listing/Black Lever Belt/3.webp",
  "/images/belts/listing/Black Lever Belt/4.webp",
];

const blackBerserkDescriptionImages = [
  "/images/belts/product description/Black:Berserk Product description/1.webp",
  "/images/belts/product description/Black:Berserk Product description/2.webp",
  "/images/belts/product description/Black:Berserk Product description/3.webp",
  "/images/belts/product description/Black:Berserk Product description/4.webp",
  "/images/belts/product description/Black:Berserk Product description/5.webp",
];

const strapDescriptionGalleryImages = [
  "/images/straps/product description/22.webp",
  "/images/straps/product description/33.webp",
  "/images/straps/product description/44.webp",
  "/images/straps/product description/55.webp",
  "/images/straps/product description/66.webp",
  "/images/straps/product description/77.webp",
];

export const strapProduct: ProductDetailConfig = {
  id: 1,
  slug: "straps",
  name: "FORGE Wrist Straps",
  cartName: "FORGE Wrist Straps",
  price: 9.99,
  originalPrice: "$19.99",
  kicker: "Premium Lifting Gear",
  images: strapProductImages,
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
  reviews: [
    {
      name: "Denis",
      rating: 5,
      date: "Reviewed in the United States on October 24, 2025",
      text: "I mainly use these for deadlifts and heavy rows, and they lock in better than the cheap pair I had before. The wrap is secure without digging into my wrists.",
    },
    {
      name: "Amy Jacobson",
      rating: 4,
      date: "Reviewed in the United States on November 6, 2025",
      text: "Bought these for my husband for gym use on pull days. They were a bit stiff the first couple sessions, but once broken in they felt much better.",
    },
    {
      name: "Darell",
      rating: 5,
      date: "Reviewed in the United States on October 29, 2025",
      text: "Used them on barbell rows and RDLs this week and they held up great. Easy to tighten, easy to release, and they don't feel bulky in the gym bag.",
    },
  ],
  buyNowUrl:
    "https://www.amazon.com/dp/B0FN79GGQ9?tag=68326-forgexfit-20&linkCode=ogi&th=1&psc=1&ascsubtag=srctok-c64406ef1da9d8bb&btn_ref=srctok-c64406ef1da9d8bb",
  href: "/product/straps",
};

export const beltBaseProduct = {
  id: 2,
  slug: "zeus",
  cartName: "FORGE Lever Belt",
  price: 65,
  kicker: "Premium Lifting Gear",
  imageAlts: zeusBeltImageAlts,
  featureList: [
    "Secure lever closure for fast adjustments",
    "Rigid support for heavy strength work",
    "Competition-ready structure and feel",
    "Three variant options within one product line",
  ],
  intro:
    "Built to lock in your core under serious weight. The FORGE Lever Belt delivers support, speed, and a premium finish across every variant.",
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
  specificationGroups: [
    {
      title: "Product Information",
      rows: [
        ["Brand:", "FORGE GYM"],
        ["Category:", "Lever Belt"],
        ["Variants:", "Zeus, Berserk, Black"],
        ["Closure:", "Lever"],
      ],
    },
    {
      title: "Use Case",
      bullets: [
        "Heavy squats and deadlifts",
        "Powerlifting and strength training",
        "Fast on-off lever adjustment",
      ],
    },
    {
      title: "Construction",
      rows: [
        ["Material:", "Premium structured belt build"],
        ["Support:", "Rigid core bracing"],
        ["Fit:", "Variant-based design selection"],
      ],
    },
  ],
  reviews: [
    {
      name: "Marcus T.",
      rating: 5,
      date: "Reviewed in the United States on January 12, 2026",
      text: "I’ve been using this belt for squat days and the lever feels solid every time. It started a little stiff, but after two weeks it settled in nicely.",
    },
    {
      name: "Jen R.",
      rating: 4,
      date: "Reviewed in the United States on February 3, 2026",
      text: "Great belt for deadlift and squat sessions, especially if you like a very rigid feel. It took me a few workouts to dial in the fit, but support is excellent once set.",
    },
    {
      name: "Luis",
      rating: 5,
      date: "Reviewed in the United States on February 18, 2026",
      text: "I train four days a week and use it for most of my heavy gym work. The brace feels consistent and the lever is quick between sets.",
    },
    {
      name: "Aaron P.",
      rating: 4,
      date: "Reviewed in the United States on March 6, 2026",
      text: "Bought the belt mainly for heavy squat work and it does the job well. A little more rigid than I expected at first, but that’s probably why it feels so supportive.",
    },
  ],
  buyNowUrl: "/cart",
  href: "/product/belt?variant=zeus",
};

export const beltDescriptionGalleryBySlug: Record<BeltProductSlug, string[]> = {
  zeus: [
    "/product-description/zeus/1.png",
    "/product-description/zeus/2.png",
    "/product-description/zeus/3.png",
  ],
  berserk: blackBerserkDescriptionImages,
  black: blackBerserkDescriptionImages,
};

export const products: ProductCatalogItem[] = [
  {
    id: "belt-zeus",
    slug: "zeus",
    name: "Zeus Lever Belt",
    price: 65,
    originalPrice: "$85",
    href: "/product/belt?variant=zeus",
    images: zeusBeltImages,
    description:
      "A rigid FORGE lever belt built for aggressive bracing, fast setup, and heavy lower-body training sessions.",
    category: "Lifting Belt",
    rating: 4.9,
    reviewCount: 32,
  },
  {
    id: "belt-berserk",
    slug: "berserk",
    name: "Berserk Lever Belt",
    price: 65,
    originalPrice: "$85",
    href: "/product/belt?variant=berserk",
    images: berserkBeltImages,
    description:
      "The Berserk variant keeps the same FORGE belt platform with a bold finish and locked-in support for compound lifts.",
    category: "Lifting Belt",
    rating: 4.8,
    reviewCount: 28,
  },
  {
    id: "belt-black",
    slug: "black",
    name: "Black Lever Belt",
    price: 65,
    originalPrice: "$85",
    href: "/product/belt?variant=black",
    images: blackBeltImages,
    description:
      "A stealth black FORGE lever belt with the same rigid platform, fast lever closure, and heavy-duty support.",
    category: "Lifting Belt",
    rating: 4.8,
    reviewCount: 19,
  },
  {
    id: "wrist-straps",
    slug: "straps",
    name: "FORGE Wrist Straps",
    price: 9.99,
    originalPrice: "$19.99",
    href: "/product/straps",
    images: strapProduct.images,
    description:
      "Cotton-blend lifting straps with a secure wrap and padded wrist support for heavy pulls and higher-volume back work.",
    category: "Accessories",
    rating: 4.9,
    reviewCount: 41,
  },
];

export type BeltProductSlug = "zeus" | "berserk" | "black";

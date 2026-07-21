export const products = [
  {
    id: "sunscreen",
    slug: "sunscreen",
    name: "Ultra Light Sunscreen SPF 50+",
    price: 690,
    rating: 4.8,
    netVolume: "50 mL (1.7 fl oz)",
    subtitle: "Powerful Protection — Non-Greasy Formula",
    badge: "SPF 50+ PA++++",
    themeColor: "brand-accent", // burnt-orange
    keyActives: [
      "2% Niacinamide",
      "Vitamin E",
      "Zinc Oxide",
      "Titanium Dioxide",
      "Licorice (Glycyrrhiza Glabra) Extract"
    ],
    benefits: [
      "Prevents sunburn",
      "Keeps skin healthy & safe",
      "Reduces tanning & dark spots",
      "Protects from UV rays"
    ],
    howToUse: [
      "Apply on clean, dry skin",
      "Use the right amount",
      "Apply 15–20 minutes before sun exposure",
      "Massage gently",
      "Reapply every 2–3 hours",
      "Use daily"
    ],
    ingredients: "Water, EDTA 2Na, Glycerin, Stearic Acid, Microwax Ewax, Glyceryl Mono Stearate SE, Cetostearyl Alcohol, Ethylhexyl Methoxycinnamate, Butyl Methoxydibenzoylmethane, Benzophenone-3, Butylene Glycol, Phospholipid, Zinc Oxide, Titanium Dioxide, Isopropyl Myristate, Niacinamide, Caprylic/Capric Triglyceride, Dimethicone, Vitamin E Acetate, Glycyrrhiza Glabra (Licorice) Extract, Ethylhexylglycerin, Phenoxyethanol",
    tags: ["Weightless Daily Protection", "Non-Greasy"],
    images: [
      "/images/sunscreen.png",
      "/images/sunscreen_back.png",
      "/images/sunscreen_texture.png",
      "/images/sunscreen.png"
    ]
  },
  {
    id: "face-wash",
    slug: "face-wash",
    name: "Bright Skin Face Wash",
    price: 395,
    rating: 4.8,
    netVolume: "100 mL",
    subtitle: "Effective Gentle Care — Deep Cleansing Formula",
    badge: "For All Skin Types",
    themeColor: "brand-secondary", // navy blue
    keyActives: [
      "Salicylic Acid",
      "Niacinamide",
      "Alpha Arbutin",
      "Glycolic Acid"
    ],
    benefits: [
      "For All Skin Types",
      "Fragrance Free",
      "Daily Use",
      "Deeply Cleanses & Brightens"
    ],
    howToUse: [
      "Wet Face",
      "Massage Gently",
      "Rinse Well"
    ],
    ingredients: "Water, Glycerin, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Coco Diethanolamine, Coco Glucoside, Niacinamide, Alpha Arbutin, Glycyrrhiza Glabra (Licorice Extract), Carica Papaya (Papaya Extract), Salicylic Acid, Glycolic Acid, Aloe Barbadensis Extract, D-Panthenol, Allantoin, Disodium EDTA, PEG-150 Distearate, DMDM Hydantoin, Fragrance, Citric Acid",
    caution: [
      "For external use only",
      "Avoid contact with eyes",
      "Discontinue use if irritation occurs",
      "Keep out of reach of children"
    ],
    tags: ["For All Skin Types", "Fragrance Free", "Daily Use"],
    images: [
      "/images/facewash.png",
      "/images/facewash_back.png",
      "/images/facewash_texture.png",
      "/images/facewash.png"
    ]
  },
  {
    id: "combo",
    slug: "combo",
    name: "The Glow Duo (Combo)",
    price: 999,
    rating: 3.5,
    originalPrice: 1085,
    savings: 86,
    netVolume: "50 mL + 100 mL",
    subtitle: "Complete Daily Ritual — Powerful Protection & Effective Gentle Care",
    badge: "Best Value",
    themeColor: "brand-dark", // charcoal
    keyActives: [
      "2% Niacinamide",
      "Salicylic Acid",
      "Alpha Arbutin",
      "Zinc Oxide",
      "Vitamin E",
      "Glycolic Acid"
    ],
    benefits: [
      "Complete Daily skincare ritual",
      "Maximum protection & gentle wash",
      "Saves ₹86 over individual prices",
      "Dermatologist approved actives"
    ],
    howToUse: [
      "Cleanse face thoroughly with Bright Skin Face Wash",
      "Pat dry and follow with skincare routine",
      "Apply Ultra Light Sunscreen SPF 50+ generously before going out"
    ],
    ingredients: "Refer to individual product ingredient lists.",
    tags: ["Bestseller", "Daily Routine Set", "Complete Care"],
    images: [
      "/images/combo.png",
      "/images/sunscreen.png",
      "/images/facewash.png",
      "/images/combo.png"
    ]
  }
];

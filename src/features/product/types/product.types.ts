export interface ProductVariant {
  unit:             string;
  price:            number;
  quantity:         number;
  sku:              string;
  minOrderQuantity: number;
  bulkPrice:        number;
  stockThreshold:   number;
  weight:           number;
  weightUnit:       string;
  piecesCount:      number;
  packetQuantity:   number;
  caseQuantity:     number;
  manufactureDate?: string;
  expiryDate?:      string;
}

export interface Product {
  id:                 string;
  name:               string;
  slug:               string;
  description:        string;
  category:           string;   // category _id string
  categoryId:         string;   // same as category, used for filtering
  categoryName?:      string;   // ✅ human-readable category name
  tags:               string[];
  variants:           ProductVariant[];
  images:             { url: string; publicId?: string; altText?: string }[];
  image:              string;
  featured:           boolean;
  isActive:           boolean;
  isDeleted:          boolean;
  discountPercentage: number;
  totalStock:         number;
  inStock:            boolean;
  lowStockVariants:   ProductVariant[];
  createdBy:          string;
  updatedBy:          string;
  createdAt:          string;
  updatedAt:          string;
  shortDescription:   string;
  brand:              string;
  quality:            string;
  countryOrigin:      string;
  storageInstruction: string;
  usageInstruction:   string;
  halal:              boolean;
  frozen:             boolean;
  fresh:              boolean;
  bestSeller:         boolean;
  newArrival:         boolean;
  rating:             number;
  reviewCount:        number;
  totalReviews:       number;
  totalSold:          number;
  totalViews:         number;
}

export interface Category {
  id:      string;   // _id from MongoDB
  name:    string;
  color?:  string;
  image?:  string | number; // string for remote URL, number for local require() — used for the small circular icon
  banner?: string;          // wide banner image for the category strip — only set if admin uploaded one
}

export interface CartItem {
  product:         Product;
  selectedVariant: ProductVariant;
  quantity:        number;
}
// product/types/product.types.ts

// ── Variant ───────────────────────────────────────────────────────────────
export interface ProductVariant {
  unit: string;

  price: number;

  quantity: number;

  weight: number;

  weightUnit: string;

  piecesCount: number;

  packetQuantity: number;

  caseQuantity: number;

  manufactureDate?: string;

  expiryDate?: string;

  sku: string;

  minOrderQuantity: number;

  bulkPrice: number;

  stockThreshold: number;

  isLowStock?: boolean;

  // OPTIONAL UI HELPERS
  formattedWeight?: string;

  discountPrice?: number;
}

// ── Product Image ─────────────────────────────────────────────────────────
export interface ProductImage {
  url: string;

  publicId?: string;

  altText?: string;
}

// ── Product ───────────────────────────────────────────────────────────────
export interface Product {
  id: string;

  // BASIC INFO
  name: string;

  slug: string;

  shortDescription: string;

  description: string;

  category: string;

  categoryId?: string;

  brand: string;

  quality: string;

  countryOrigin: string;

  storageInstruction: string;

  usageInstruction: string;

  tags: string[];

  thumbnail?: string;

  supplier?: string;

  // VARIANTS
  variants: ProductVariant[];

  // IMAGES
  images: ProductImage[];

  image: string;

  // PRODUCT FLAGS
  featured: boolean;

  bestSeller: boolean;

  newArrival: boolean;

  halal: boolean;

  frozen: boolean;

  fresh: boolean;

  organic?: boolean;

  // STATUS
  isActive: boolean;

  isDeleted: boolean;

  // DISCOUNT
  discountPercentage: number;

  // STOCK
  totalStock: number;

  inStock: boolean;

  lowStockVariants: ProductVariant[];

  // ANALYTICS
  rating: number;

  totalReviews: number;

  totalSold: number;

  totalViews: number;

  reviewCount?: number;

  soldCount?: number;

  // AUDIT
  createdBy: string;

  updatedBy?: string;

  createdAt: string;

  updatedAt: string;
}

// ── Category ──────────────────────────────────────────────────────────────
export interface Category {
  id: string;

  name: string;

  color?: string;

  image?: string;
}

// ── Banner ────────────────────────────────────────────────────────────────
export interface Banner {
  id: string;

  title: string;

  subtitle: string;

  tagline?: string;

  backgroundColor: string;

  image: string;
}

// ── Cart ──────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;

  selectedVariant: ProductVariant;

  quantity: number;
}
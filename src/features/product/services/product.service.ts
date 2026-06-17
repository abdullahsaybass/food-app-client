/**
 * product/services/product.service.ts
 */

import { API } from '../../../app/lib/api';
import type { Product, ProductVariant, Category } from '../types/product.types';

// ── Backend variant shape ─────────────────────────────────────────────────────
interface BackendVariant {
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
  manufactureDate?: string | null;
  expiryDate?:      string | null;
}

// ── Backend product shape ─────────────────────────────────────────────────────
interface BackendProduct {
  _id:                string;
  id?:                string;
  name:               string;
  slug:               string;
  description:        string;
  // ✅ category is now a populated object from the backend
  category:           { id?: string; _id?: string; name?: string; slug?: string; key?: string; image?: string } | string | null;
  tags:               string[];
  variants:           BackendVariant[];
  images:             { url: string; publicId?: string; altText?: string }[];
  featured:           boolean;
  isActive:           boolean;
  isDeleted:          boolean;
  discountPercentage: number;
  totalStock:         number;
  inStock:            boolean;
  lowStockVariants:   BackendVariant[];
  createdBy:          string;
  updatedBy?:         string;
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
  totalReviews:       number;
  totalSold:          number;
  totalViews:         number;
}

// ── Backend category shape ────────────────────────────────────────────────────
interface BackendCategory {
  _id:          string;
  id?:          string;
  name:         string;
  // Backend returns image as an object: { url, publicId, altText } — not a plain string.
  image?:       { url?: string | null; publicId?: string | null; altText?: string } | string | null;
  banner?:      { url?: string | null; publicId?: string | null; altText?: string } | string | null;
  color?:       string;
  isActive?:    boolean;
  description?: string;
}
export interface CartItem {
  product:         Product;
  selectedVariant: ProductVariant;
  quantity:        number;
}

// ── Helper: safely extract category id and name ───────────────────────────────
// ✅ FIX: category is now an object { id, name, slug } not a plain string
const extractCategory = (raw: BackendProduct['category']): { id: string; name: string } => {
  if (!raw) return { id: '', name: '' };
  if (typeof raw === 'string') {
    return { id: raw.toLowerCase().trim(), name: raw };
  }
  const id   = (raw.id ?? raw._id ?? '').trim();
  const name = raw.name ?? '';
  return { id, name };
};

// ── Map backend variant → ProductVariant ─────────────────────────────────────
const toVariant = (v: BackendVariant): ProductVariant => ({
  unit:             v.unit             ?? 'pcs',
  price:            v.price            ?? 0,
  quantity:         v.quantity         ?? 0,
  sku:              v.sku              ?? '',
  minOrderQuantity: v.minOrderQuantity ?? 1,
  bulkPrice:        v.bulkPrice        ?? 0,
  stockThreshold:   v.stockThreshold   ?? 10,
  weight:           v.weight           ?? 0,
  weightUnit:       v.weightUnit       ?? 'kg',
  piecesCount:      v.piecesCount      ?? 0,
  packetQuantity:   v.packetQuantity   ?? 0,
  caseQuantity:     v.caseQuantity     ?? 0,
  manufactureDate:  v.manufactureDate  ?? undefined,
  expiryDate:       v.expiryDate       ?? undefined,
});

// ── Map backend product → Product ────────────────────────────────────────────
const toProduct = (p: BackendProduct): Product => {
  const variants: ProductVariant[] = (p.variants ?? []).map(toVariant);
  // ✅ FIX: extract category safely from object
  const cat = extractCategory(p.category);

  return {
    id:                 p._id ?? p.id ?? '',
    name:               p.name               ?? '',
    slug:               p.slug               ?? '',
    description:        p.description        ?? '',
    category:           cat.id,    // ✅ always a safe string (_id)
    categoryId:         cat.id,    // ✅ used for filtering
    categoryName:       cat.name,  // ✅ human-readable name
    tags:               p.tags               ?? [],
    variants,
    images:             p.images             ?? [],
    image:              p.images?.[0]?.url   ?? '',
    featured:           p.featured           ?? false,
    isActive:           p.isActive           ?? true,
    isDeleted:          p.isDeleted          ?? false,
    discountPercentage: p.discountPercentage ?? 0,
    totalStock:         p.totalStock         ?? variants.reduce((s, v) => s + v.quantity, 0),
    inStock:            p.inStock            ?? variants.some(v => v.quantity > 0),
    lowStockVariants:   (p.lowStockVariants  ?? []).map(toVariant),
    createdBy:          p.createdBy          ?? '',
    updatedBy:          p.updatedBy          ?? '',
    createdAt:          p.createdAt          ?? '',
    updatedAt:          p.updatedAt          ?? '',
    shortDescription:   p.shortDescription   ?? '',
    brand:              p.brand              ?? '',
    quality:            p.quality            ?? '',
    countryOrigin:      p.countryOrigin      ?? '',
    storageInstruction: p.storageInstruction ?? '',
    usageInstruction:   p.usageInstruction   ?? '',
    halal:              p.halal              ?? false,
    frozen:             p.frozen             ?? false,
    fresh:              p.fresh              ?? false,
    bestSeller:         p.bestSeller         ?? false,
    newArrival:         p.newArrival         ?? false,
    rating:             p.rating             ?? 0,
    reviewCount:        p.totalReviews       ?? 0,
    totalReviews:       p.totalReviews       ?? 0,
    totalSold:          p.totalSold          ?? 0,
    totalViews:         p.totalViews         ?? 0,
  };
};

// ── Category colors ───────────────────────────────────────────────────────────
const CAT_COLORS = [
  '#FF6B35', '#6F4E37', '#E91E8C',
  '#FF9800', '#4CAF50', '#F44336', '#FFC107',
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80';

// ── Params ────────────────────────────────────────────────────────────────────
interface ListParams {
  limit?:      number;
  page?:       number;
  search?:     string;
  categoryId?: string;
  popular?:    boolean;
}

interface ListResult {
  data:       Product[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ── Service ───────────────────────────────────────────────────────────────────
export const productService = {

  // GET /api/categories
  getCategories: async (): Promise<Category[]> => {
  const { data } = await API.get('/categories');

  console.log(
    'CATEGORY API RESPONSE',
    JSON.stringify(data, null, 2)
  );

  const raw: BackendCategory[] = data?.data ?? data?.categories ?? [];

  const mapped: Category[] = raw
    .filter(c => c.isActive !== false)
    .map((c, i) => ({
      id: c._id ?? c.id ?? '',
      name: c.name ?? '',
      color: c.color ?? CAT_COLORS[i % CAT_COLORS.length],
      image:
        (typeof c.image === 'string'
          ? c.image
          : c.image?.url) || FALLBACK_IMAGE,
      // ✅ banner is its own field — no fallback. If the admin didn't upload
      // a banner, this stays undefined so the UI skips it entirely instead
      // of substituting the small category `image` thumbnail.
      banner:
        (typeof c.banner === 'string'
          ? c.banner
          : c.banner?.url) || undefined,
    }));

  return [
    { id: 'all', name: 'All', color: '#FF6B35', image: FALLBACK_IMAGE },
    ...mapped,
  ];
},

  // GET /api/products
  listProducts: async (params: ListParams = {}): Promise<ListResult> => {
    const query: Record<string, any> = {
      isActive: true,
      limit:    params.limit ?? 10,
      page:     params.page  ?? 1,
    };
    

    if (params.search)  query.search = params.search;
    if (params.popular) { query.sortBy = 'createdAt'; query.sortOrder = 'desc'; }

    // ✅ FIX: send category _id to backend — let server filter, not client
    if (params.categoryId && params.categoryId !== 'all') {
      query.category = params.categoryId;
    }

    const { data } = await API.get('/products', { params: query });

    const products = (data.data.products as BackendProduct[]).map(toProduct);

    return { data: products, pagination: data.data.pagination };
  },

  // GET /api/products/:id
  getProduct: async (id: string): Promise<Product> => {
    const { data } = await API.get(`/products/${id}`);
    const raw: BackendProduct = data.data?.product ?? data.data;
    return toProduct(raw);
  },
  
};
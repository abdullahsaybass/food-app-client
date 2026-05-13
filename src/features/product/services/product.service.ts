/**
 * product.service.ts
 * Wraps all /api/products endpoints.
 *
 * Backend routes consumed:
 *   GET  /api/products            → listProducts   (paginated + filtered)
 *   GET  /api/products/:id        → getProduct
 *   GET  /api/products/categories → getCategories  (protected)
 */

import { API } from '../../../app/lib/api';
import type { Product, Category } from '../types/product.types';

// ── Backend product shape ─────────────────────────────────────────────────────
interface BackendProduct {
  id:             string;
  name:           string;
  description:    string;
  sku:            string;
  price:          number;
  quantity:       number;
  unit:           string;
  category:       string;
  images:         { url: string; publicId: string; altText: string }[];
  isActive:       boolean;
  isLowStock:     boolean;
  stockThreshold: number;
  createdBy:      string;
  updatedBy:      string | null;
  createdAt:      string;
  updatedAt:      string;
}

// ── Backend category shape ────────────────────────────────────────────────────
interface BackendCategory {
  _id:          string;
  name:         string;
  image?:       string;
  color?:       string;
  description?: string;
}

// ── Map backend → Product ─────────────────────────────────────────────────────
const toProduct = (p: BackendProduct): Product => ({
  id:          p.id,
  name:        p.name,
  description: p.description ?? '',
  price:       p.price,
  unit:        p.unit,
  image:       p.images?.[0]?.url ?? '',
  category:    p.category,
  categoryId:  p.category,
  rating:      4.5,
  reviewCount: 0,
  inStock:     p.quantity > 0,
  seller:      p.createdBy ?? 'Store',
  vendor:      'Eshop',
});

// ── Category color palette (cycled if backend doesn't send color) ─────────────
const CAT_COLORS = ['#FF6B35', '#6F4E37', '#E91E8C', '#FF9800', '#4CAF50', '#F44336', '#FFC107'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80';

// ── Params ────────────────────────────────────────────────────────────────────
interface ListParams {
  limit?:      number;
  page?:       number;
  search?:     string;
  categoryId?: string;  // sent as `category` to backend
  popular?:    boolean;
}

interface ListResult {
  data: Product[];
  pagination: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

// ── Service ───────────────────────────────────────────────────────────────────
export const productService = {

  // GET /api/products/categories
  getCategories: async (): Promise<Category[]> => {
    const { data } = await API.get('/products/categories');

    // Handle: { data: { categories: [...] } }  or  { data: [...] }
    const raw: BackendCategory[] =
      data?.data?.categories ?? data?.data ?? data?.categories ?? [];

    const mapped: Category[] = raw.map((c, i) => ({
      id:    c._id,
      name:  c.name,
      color: c.color ?? CAT_COLORS[i % CAT_COLORS.length],
      image: c.image ?? FALLBACK_IMAGE,
    }));

    // Prepend "All" so the user can always reset the filter
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

    if (params.categoryId && params.categoryId !== 'all') {
      query.category = params.categoryId;
    }

    if (params.search) {
      query.search = params.search;
    }

    if (params.popular) {
      query.sortBy    = 'createdAt';
      query.sortOrder = 'desc';
    }

    const { data } = await API.get('/products', { params: query });
    return {
      data:       (data.data.products as BackendProduct[]).map(toProduct),
      pagination: data.data.pagination,
    };
  },

  // GET /api/products/:id
  getProduct: async (id: string): Promise<Product> => {
    const { data } = await API.get(`/products/${id}`);
    return toProduct(data.data as BackendProduct);
  },
};

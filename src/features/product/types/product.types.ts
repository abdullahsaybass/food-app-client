export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;           // e.g. "kg", "piece", "500g"
  image: string;          // URL or local require path
  category: string;
  categoryId: string;
  rating: number;
  reviewCount: number;
  discount?: number;      // percentage e.g. 35
  isPopular?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  seller?: string;
  vendor?: string;
}

export interface Category {
   id: string;
  name: string;
  color: string;
  image: string;          // background tint for category chip
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  backgroundColor: string;
  image: string;  
}

export interface CartItem {
  product: Product;
  quantity: number;
}
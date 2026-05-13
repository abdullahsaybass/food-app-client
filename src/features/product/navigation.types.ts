/**
 * navigation.types.ts
 * Central param list for the product stack navigator.
 *
 * ProductList accepts an optional categoryId — no `popular` flag needed
 * because popularity is the default sort handled inside ProductList itself.
 */

export type ProductStackParamList = {
  HomeScreen:    undefined;
  ProductDetail: { productId: string };
  // categoryId is optional — omit it to show all products (default: popular sort)
  ProductList:   { categoryId?: string };
  Cart:          undefined;
};

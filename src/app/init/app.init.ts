import { useAuthStore } from '../../features/auth/store/auth.store';
import { useProductStore } from '../../features/product/store/product.store';

export const initAuth = async () => {
  try {
    console.log("Starting hydrate...");

    await useAuthStore.getState().hydrate();

    console.log("Hydrate success");

    // Only fetch cart if user is authenticated
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      await useProductStore.getState().fetchCart();
      console.log("Cart fetched");
    }
  } catch (error) {
    console.log("Hydrate error:", error);
  }
};
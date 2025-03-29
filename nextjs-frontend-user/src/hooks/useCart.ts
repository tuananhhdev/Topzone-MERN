import { create } from "zustand";
import { TProduct } from "@/types/product";

interface CartItem {
  product: TProduct;
  selectedVariant?: {
    storage: string;
    price: number;
    stock: number;
  };
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: TProduct & { selectedVariant?: CartItem["selectedVariant"] }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product._id === product._id
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            product,
            selectedVariant: product.selectedVariant,
            quantity: 1,
          },
        ],
      };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product._id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ items: [] }),
})); 
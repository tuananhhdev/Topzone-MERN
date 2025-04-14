"use client";

import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

interface IProduct {
  price_end: number;
  _id: string;
  product_name: string;
  price: number;
  discount: number;
  thumbnail: string;
  slug: string;
  category: {
    _id: string;
    category_name: string;
    slug: string;
  };
  quantity: number; // Đảm bảo quantity luôn là số
}

interface CartState {
  cart: IProduct[];
  isAnimating: boolean;
  addToCart: (product: IProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  triggerCartAnimation: () => void;
  totalAmount: number;
  calculateTotalAmount: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      totalAmount: 0,
      isAnimating: false,
      addToCart: (product) => {
        const existingProduct = get().cart.find((item) => item._id === product._id);
        if (existingProduct) {
          set((state) => ({
            cart: state.cart.map((item) =>
              item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          }));
        } else {
          set((state) => ({
            cart: [...state.cart, { ...product, quantity: 1 }],
          }));
        }
        get().triggerCartAnimation();
      },
      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item._id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          cart: state.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
        }));
      },
      triggerCartAnimation: () => {
        set({ isAnimating: true });
        setTimeout(() => {
          set({ isAnimating: false });
        }, 500);
      },
      calculateTotalAmount: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      clearCart: () => {
        set({ cart: [], totalAmount: 0 });
        localStorage.removeItem("cart-storage");
      },
    }),
    {
      name: "cart-storage", // unique name
    } as PersistOptions<CartState>
  )
);

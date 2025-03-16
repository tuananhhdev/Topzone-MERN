"use client";

import { useRouter } from "next/navigation"; // Sử dụng từ next/navigation
import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/useCart";
import { useForm } from "react-hook-form";

interface IProduct {
    _id: string;
    product_name: string;
    price: number;
    quantity: number;
    discount: number;
    thumbnail: string;
  }

export const useCartLogic = () => {
  const router = useRouter(); // Thay thế từ next/navigation
  const cartItems = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const { control, watch, setValue } = useForm({
    defaultValues: {
      selectedItems: [] as string[],
      selectAll: false,
    },
  });

  const selectedItems = watch("selectedItems");
  const selectAll = watch("selectAll");

  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    updateTotalAmount();
  }, [selectedItems, cartItems]);

  const updateTotalAmount = () => {
    const newTotal = cartItems.reduce((total, item) => {
      const isSelected = selectedItems.includes(item._id);
      if (isSelected || !selectedItems.length) {
        return total + item.price * item.quantity;
      }
      return total;
    }, 0);

    setTotalAmount(newTotal);
    setDiscount(newTotal > 1000000 ? newTotal * 0.1 : 0);
  };

  const toggleSelect = (id: string) => {
    setValue(
      "selectedItems",
      selectedItems.includes(id)
        ? selectedItems.filter((itemId) => itemId !== id)
        : [...selectedItems, id]
    );
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const product = cartItems.find((item) => item._id === productId);
    if (product && (change > 0 || product.quantity > 1)) {
      updateQuantity(productId, product.quantity + change);
      updateTotalAmount();
    }
  };

  const handleSelectAll = () => {
    setValue(
      "selectedItems",
      selectAll ? [] : cartItems.map((item) => item._id)
    );
    setValue("selectAll", !selectAll);
  };

  const redirectToCheckout = (selectedItems: string[]) => {
    // Lưu vào localStorage
    localStorage.setItem("itemsToCheckout", JSON.stringify(selectedItems));
  
    // Chuyển hướng
    router.push("/checkout");
  };
  

  return {
    cartItems,
    removeFromCart,
    control,
    selectedItems,
    selectAll,
    totalAmount,
    discount,
    toggleSelect,
    handleQuantityChange,
    handleSelectAll,
    redirectToCheckout,
  };
};

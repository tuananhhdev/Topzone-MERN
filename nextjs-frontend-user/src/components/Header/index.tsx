"use client";

import { useCartStore } from "@/stores/useCart";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Badge from "@mui/material/Badge";
import { formatToVND } from "@/helpers/formatPrice";
import { SETTINGS } from "@/config/settings";
import IconButton from "@mui/material/IconButton";
import { IoTrashOutline } from "react-icons/io5";
import { Menu } from "@headlessui/react";
import { motion } from "framer-motion";
import "../../styles/header.css";
import ProfileDropdown from "../ProfileDropdown";
import Image from "next/image";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const cartCount = cart.length;
  const isAnimating = useCartStore((state) => state.isAnimating);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`bg-[#101010] text-white ${
          isScrolled ? "fixed left-0 top-0 z-50 w-full shadow-lg" : ""
        }`}
      >
        <div className="main-container">
          <div className="flex items-center justify-between">
            <div>
              <Link href={"/"}>
                <span className="font-mono text-4xl">TOPZONE</span>
              </Link>
            </div>
            <nav>
              <ul className="flex items-center space-x-4">
                <li className="relative mr-5">
                  <Menu>
                    <Menu.Button>
                      <motion.div
                        animate={{ scale: isAnimating ? 1.2 : 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Badge badgeContent={cartCount || "0"} color="error">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                          </svg>
                        </Badge>
                      </motion.div>
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-[280px] rounded-lg bg-white shadow-lg">
      <div className="p-4">
        {cartCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            {/* Hình minh họa giỏ hàng trống */}
            <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mb-4 text-gray-400"
  >
    {/* Thay bằng nội dung SVG từ file tải về */}
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
            {/* Thông báo */}
            <p className="mb-3 text-center text-gray-600 font-medium">
              Giỏ hàng của bạn đang trống!
            </p>
            
          </div>
        ) : (
          <>
            <ul>
              {cart.map((product) => (
                <li key={product._id} className="mb-5 flex items-center">
                  <Image
                    src={`${SETTINGS.URL_IMAGE}/${product.thumbnail}`}
                    alt={product.product_name}
                    width={50}
                    height={50}
                    className="mr-2 h-14 w-14 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="product-name font-semibold text-gray-700">
                      {product.product_name}
                    </p>
                    <div className="flex items-center">
                      <p className="mr-6 text-gray-500">
                        {formatToVND(product.price * (1 - product.discount / 100))}
                      </p>
                      <span className="ml-2 text-gray-500">
                        x{product.quantity || 1}
                      </span>
                    </div>
                  </div>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => removeFromCart(product._id)}
                  >
                    <IoTrashOutline className="text-rose-600" />
                  </IconButton>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link href="/cart">
                <button className="w-full rounded-lg bg-[#212121] py-2 font-medium text-white transition duration-300 hover:bg-[#212121]/90">
                  Xem giỏ hàng
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Menu.Items>
                  </Menu>
                </li>

                <li>
                  <ProfileDropdown />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

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
        className={`py-4 text-white bg-[#212121] ${
          isScrolled ? "fixed top-0 left-0 w-full shadow-lg z-50" : ""
        }`}
      >
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <Link href={"/"}>
                <span className="text-4xl font-mono">TOPZONE</span>
              </Link>
            </div>
            <nav>
              <ul className="flex items-center space-x-4">
                <li className="relative mr-4">
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
                    <Menu.Items className="absolute right-0 mt-2 w-[280px] bg-white rounded-lg shadow-lg z-10">
                      <div className="p-4">
                        {cartCount === 0 ? (
                          <p className="text-gray-700 text-center">
                            Không có sản phẩm
                          </p>
                        ) : (
                          <>
                            <ul>
                              {cart.map((product) => (
                                <li
                                  key={product._id}
                                  className="flex items-center mb-5"
                                >
                                  <img
                                    src={`${SETTINGS.URL_IMAGE}/${product.thumbnail}`}
                                    alt={product.product_name}
                                    className="w-14 h-14 object-cover rounded mr-2"
                                  />
                                  <div className="flex-1">
                                    <p className="product-name text-gray-700 font-semibold">
                                      {product.product_name}
                                    </p>
                                    <div className="flex items-center">
                                      <p className="text-gray-500 mr-6">
                                        {formatToVND(
                                          product.price *
                                            (1 - product.discount / 100)
                                        )}
                                      </p>
                                      <span className="text-gray-500 ml-2">
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
                                <button className="w-full bg-[#212121] text-white font-medium py-2 rounded-lg hover:bg-[#212121]/90 transition duration-300">
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

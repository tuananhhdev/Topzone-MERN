"use client";

import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardList,
  LogOut,
  User,
  Bell,
  Settings,
  CreditCard,
  ChevronDown,
  Shield,
  TrendingUp,
} from "lucide-react"; // Thêm TrendingUp cho "Dashboard"
import { useAuthStore } from "@/stores/useAuth";

const ProfileDropdown = () => {
  const {
    isAuthenticated,
    user,
    logout,
    initializeFromToken,
    checkInitialAuth,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Đảm bảo trạng thái ban đầu của xác thực được kiểm tra một lần
  const isInitiallyAuthenticated = checkInitialAuth();

  useEffect(() => {
    initializeFromToken();
    setIsLoading(false);
  }, [initializeFromToken]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  // Loading state với skeleton UI
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="hidden md:block w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isInitiallyAuthenticated && !isAuthenticated) {
    return (
      <div>
        <Link href="/login">
          <button className="px-5 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md">
            Đăng nhập
          </button>
        </Link>
      </div>
    );
  }

  const encodedFullName = encodeURIComponent(user?.full_name || "Người dùng");
  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodedFullName}&background=random`;

  const userRole = user?.role || "Thành viên";

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {/* User dropdown */}
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <Menu.Button className="group flex items-center gap-3 rounded-xl py-2 px-3 bg-white hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
              {/* Avatar với status indicator */}
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-blue-50 group-hover:ring-blue-100 transition-all duration-200">
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover h-full w-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodedFullName}&background=random`;
                    }}
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                </div>
              </div>

              {/* User info */}
              <div className="hidden md:flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-700 transition-colors duration-200">
                    {user?.full_name || "Người dùng"}
                  </p>
                  <div className="hidden lg:flex items-center justify-center rounded-md bg-blue-50 px-1.5 py-0.5">
                    <span className="text-[10px] font-medium text-blue-700">
                      {userRole}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {user?.email || "Chưa có email"}
                </p>
              </div>

              {/* Dropdown icon with animation */}
              <div className="flex items-center ml-1">
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  className={`text-gray-400 transition-transform duration-300 group-hover:text-blue-600 ${open ? "rotate-180 text-blue-600" : ""}`}
                />
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-50 mt-3 w-72 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                {/* Header */}
                <div>
                  {/* Header card với thiết kế hiện đại */}
                  <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                    {/* Cover photo */}
                    <div className="h-24 w-full bg-gradient-to-r from-blue-400 to-indigo-500 relative">
                      {/* Decorative elements */}
                      <div className="absolute top-0 left-0 w-full h-full opacity-20">
                        <div className="absolute top-0 left-1/4 w-16 h-16 rounded-full bg-white"></div>
                        <div className="absolute bottom-0 right-1/4 w-24 h-24 rounded-full bg-indigo-300"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-blue-300 opacity-40"></div>
                      </div>

                      {/* Premium indicator */}
                      <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2.5 py-0.5 flex items-center shadow-sm">
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1.5"></span>
                        <span className="text-xs font-medium text-gray-700">
                          Premium
                        </span>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      {/* Avatar wrapper - lifted above the cover */}
                      <div className="flex justify-center sm:justify-start -mt-10 mb-3">
                        <div className="relative inline-block">
                          {/* Avatar with border */}
                          <div className="rounded-full bg-white p-1.5 shadow-md">
                            <Image
                              src={avatarUrl}
                              alt="Avatar"
                              width={72}
                              height={72}
                              className="rounded-full object-cover h-full w-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://ui-avatars.com/api/?name=${encodedFullName}&background=random`;
                              }}
                            />
                          </div>

                          {/* Status badge with pulse animation */}
                          <div className="absolute bottom-1.5 right-1.5">
                            <span className="relative flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 ring-2 ring-white"></span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User info */}
                      <div className="text-center sm:text-left space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-gray-900 font-bold truncate text-xl">
                            {user?.full_name || "Chưa có thông tin"}
                          </h3>

                          {/* Verification badge */}
                          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2.5 py-1 mt-1 sm:mt-0">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9 12L11 14L15 10M12 3L13.9101 4.87147L16.5 4.2L17.2426 6.75736L19.7835 7.5L19.1279 10.091L21 12L19.1279 13.909L19.7835 16.5L17.2426 17.2426L16.5 19.7835L13.9101 19.1279L12 21L10.091 19.1279L7.5 19.7835L6.75736 17.2426L4.2 16.5L4.87147 13.9101L3 12L4.87147 10.091L4.2 7.5L6.75736 6.75736L7.5 4.2L10.091 4.87147L12 3Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Đã xác thực
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                          {/* Email */}
                          <p className="text-sm text-gray-500 truncate flex items-center">
                            <svg
                              className="w-3.5 h-3.5 mr-1.5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              ></path>
                            </svg>
                            {user?.email || "Chưa có email"}
                          </p>
                        </div>

                        {/* Role badge */}
                        <div className="flex justify-center sm:justify-start mt-2">
                          <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            <Shield size={14} className="mr-1.5" />
                            {userRole}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main menu */}
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/profile"
                        className={`${
                          active ? "bg-gray-50" : ""
                        } group flex items-center px-4 py-2.5 text-sm`}
                      >
                        <div
                          className={`mr-3 p-2 rounded-lg ${active ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                        >
                          <User size={18} />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${active ? "text-blue-600" : "text-gray-700"}`}
                          >
                            Thông tin tài khoản
                          </p>
                          <p className="text-xs text-gray-500">
                            Xem và chỉnh sửa thông tin cá nhân
                          </p>
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/orders"
                        className={`${
                          active ? "bg-gray-50" : ""
                        } group flex items-center px-4 py-2.5 text-sm`}
                      >
                        <div
                          className={`mr-3 p-2 rounded-lg ${active ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                        >
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${active ? "text-blue-600" : "text-gray-700"}`}
                          >
                            Đơn hàng
                          </p>
                          <p className="text-xs text-gray-500">
                            Xem lịch sử đơn hàng của bạn
                          </p>
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                </div>

                {/* Footer */}
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left"
                      >
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center">
                            <div
                              className={`mr-3 p-2 rounded-lg ${active ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}
                            >
                              <LogOut size={18} />
                            </div>
                            <span
                              className={`font-medium ${active ? "text-red-600" : "text-gray-700"}`}
                            >
                              Đăng xuất
                            </span>
                          </div>
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default ProfileDropdown;

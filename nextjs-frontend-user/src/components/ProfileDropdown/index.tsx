"use client";

import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { ClipboardList, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/stores/useAuth";

const ProfileDropdown = () => {
  const { isAuthenticated, user, logout, initializeFromToken, checkInitialAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const isInitiallyAuthenticated = checkInitialAuth();

  useEffect(() => {
    initializeFromToken();
    setIsLoading(false);
  }, [initializeFromToken]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (isLoading) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!isInitiallyAuthenticated && !isAuthenticated) {
    return (
      <Link href="/login">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200">
          Đăng nhập
        </button>
      </Link>
    );
  }

  // Đảm bảo luôn có dữ liệu user từ token hoặc API
  const encodedFullName = encodeURIComponent(user?.full_name || "Người dùng");
  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodedFullName}&background=random`;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="focus:outline-none">
        <Image
          src={avatarUrl}
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full transition-transform duration-200 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodedFullName}&background=random`;
          }}
        />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 bg-white divide-y divide-gray-100 rounded-md shadow-lg">
          <div className="flex items-center px-4 py-3 space-x-3">
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodedFullName}&background=random`;
              }}
            />
            <div className="flex-1">
              <p className="text-gray-900 font-medium truncate">
                {user?.full_name || "Chưa có"}
              </p>
              <p className="text-sm text-gray-500 truncate">{user?.email || "Chưa có"}</p>
            </div>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profile"
                  className={`${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  } px-4 py-2 text-sm flex items-center gap-2 transition-colors duration-150`}
                >
                  <User size={18} /> Hồ sơ
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/orders"
                  className={`${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  } px-4 py-2 text-sm flex items-center gap-2 transition-colors duration-150`}
                >
                  <ClipboardList size={18} /> Đơn hàng của tôi
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  } w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors duration-150`}
                >
                  <LogOut size={18} /> Đăng xuất
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ProfileDropdown;
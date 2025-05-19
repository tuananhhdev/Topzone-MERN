"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "@/stores/useAuth";
import { Sidebar } from "@/components/Profile/Sidebar";
import { ProfileSection } from "@/components/Profile/ProfileSection";
import { OrdersSection } from "@/components/Profile/OrderSection";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/stores/useTheme";
import SettingsSection from "@/components/Profile/SettingsSection";

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  city: string;
  street: string;
  state: string;
  avatar?: string;
}

interface Order {
  id: string;
  orderDate: string;
  total: number;
  status: string;
}

const ProfilePage: React.FC = () => {
  const { user, fetchProfile, updateProfile, isAuthenticated, logout, initializeFromToken, checkInitialAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfileData, setTempProfileData] = useState<Customer | null>(null);
  const [originalData, setOriginalData] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Thông tin cá nhân");
  const fullNameInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const dummyOrders: Order[] = [
    { id: "1", orderDate: "2025-05-10", total: 500000, status: "Hoàn thành" },
    { id: "2", orderDate: "2025-05-15", total: 300000, status: "Đang giao" },
  ];

  const isInitiallyAuthenticated = checkInitialAuth();

  useEffect(() => {
    initializeFromToken();
  }, [initializeFromToken]);

  useEffect(() => {
    if (!isInitiallyAuthenticated && !isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isInitiallyAuthenticated, router]);

  useEffect(() => {
    if (user) {
      const userData = {
        ...user,
        full_name: user.full_name || "",
        phone: user.phone || "",
        city: user.city || "",
        street: user.street || "",
        state: user.state || "",
      };
      setTempProfileData(userData);
      setOriginalData(userData);
    } else {
      setTempProfileData(null);
      setOriginalData(null);
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && fullNameInputRef.current) fullNameInputRef.current.focus();
  }, [isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempProfileData((prev) =>
      prev ? { ...prev, [name]: value === "" ? undefined : value } : null
    );
  };

  const handleSave = async () => {
    try {
      if (!tempProfileData?.id) throw new Error("Dữ liệu không hợp lệ");
      await updateProfile(tempProfileData);
      const updatedUser = await fetchProfile();
      console.log("Dữ liệu user sau khi cập nhật:", updatedUser);
      toast.success("Cập nhật thành công", { position: "top-right", autoClose: 3000 });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Lỗi cập nhật", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleCancel = () => {
    setTempProfileData(originalData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.info("Đã đăng xuất", { position: "top-right", autoClose: 3000 });
    router.push("/");
  };

  if (!isInitiallyAuthenticated && !isAuthenticated) {
    return null;
  }

  if (!user || !tempProfileData) {
    return null;
  }

  return (
    <motion.div
      className={`min-h-screen mt-6 py-8 px-4 sm:px-6 lg:px-8 ${theme === "light" ? "bg-gray-100 text-gray-800" : "bg-gray-900 text-gray-100"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar activeTab={activeTab || ""} setActiveTab={setActiveTab} logout={handleLogout} user={user} />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab || "Thông tin cá nhân"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex-1 ${theme === "light" ? "bg-white" : "bg-gray-800"} rounded-xl shadow-lg p-8`}
            >
              {activeTab === "Thông tin cá nhân" && (
                <ProfileSection
                  user={user}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  tempProfileData={tempProfileData}
                  originalData={originalData}
                  handleInputChange={handleInputChange}
                  handleSave={handleSave}
                  handleCancel={handleCancel}
                  fullNameInputRef={fullNameInputRef}
                />
              )}
              {activeTab === "Đơn hàng" && <OrdersSection orders={dummyOrders} />}
              {activeTab === "Cài đặt" && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;

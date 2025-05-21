"use client";

import React, { useEffect, useState, useRef } from "react";
import { useThemeStore } from "@/stores/useTheme";
import { useAuthStore } from "@/stores/useAuth";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Lock,
  Mail,
  ShieldCheck,
  Key,
  Settings as SettingsIcon,
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  X,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { toast, Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { SETTINGS } from "@/config/settings";
import QRCode, { QRCodeSVG } from "qrcode.react"; // Thêm thư viện QR Code

type Theme = "light" | "dark" | "system";

const SettingsSection = () => {
  const { theme, setTheme, getCurrentTheme } = useThemeStore();
  const { changePassword } = useAuthStore();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [activeTab, setActiveTab] = useState("appearance");
  const [step, setStep] = useState<
    "email" | "otp" | "newPassword" | "success" | "confirmLogout" | "setup2FA" | "verify2FA" 
  >("email"); // Thêm các bước mới cho 2FA
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [qrCode, setQrCode] = useState<string>(""); // Lưu QR Code
  const [secret, setSecret] = useState<string>(""); // Lưu mã bí mật
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ");
      setEmailSuccess("");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmailNotifications(localStorage.getItem("emailNotifications") === "true");
      setBrowserNotifications(localStorage.getItem("browserNotifications") === "true");
      setIs2FAEnabled(localStorage.getItem("is2FAEnabled") === "true");
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        setTheme(storedTheme as Theme);
      }
    }
  }, [setTheme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", getCurrentTheme() === "dark");
    }
  }, [theme, getCurrentTheme]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(60);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, resendTimer]);

  useEffect(() => {
    if (step === "otp" && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  const handleToggleNotification = (type: "email" | "browser", value: boolean) => {
    if (type === "email") {
      setEmailNotifications(value);
      localStorage.setItem("emailNotifications", value.toString());
      toast.success("Cập nhật thông báo email thành công", { autoClose: 1000, transition: Slide });
    } else {
      setBrowserNotifications(value);
      localStorage.setItem("browserNotifications", value.toString());
      toast.success("Cập nhật thông báo trình duyệt thành công", { autoClose: 1000, transition: Slide });
    }
  };

  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SETTINGS.URL_API}/api/auth/setup-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com" }), // Thay bằng email người dùng thực tế
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to setup 2FA");
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("setup2FA");
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message || "Không thể thiết lập 2FA"}`, { autoClose: 1500, transition: Slide });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Vui lòng nhập mã OTP 6 chữ số");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${SETTINGS.URL_API}/api/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com", token: otp }), // Thay bằng email người dùng thực tế
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid token");
      setIs2FAEnabled(true);
      localStorage.setItem("is2FAEnabled", "true");
      toast.success("Bật 2FA thành công", { autoClose: 1000, transition: Slide, position: "bottom-right", });
      setQrCode("");
      setSecret("");
      setOtp("");
      setOtpError(""); // Xóa lỗi sau khi thành công
    } catch (error: any) {
      setOtpError(error.message || "Mã OTP không đúng");
    } finally {
      setIsLoading(false);
    }
  };

// ... (giữ nguyên các phần khác không thay đổi)

const handleToggle2FA = async (value: boolean) => {
  if (value && !is2FAEnabled) {
    handleSetup2FA(); // Bắt đầu quy trình thiết lập 2FA
  } else if (!value && is2FAEnabled) {
    setIsLoading(true);
    try {
      const response = await fetch(`${SETTINGS.URL_API}/api/auth/disable-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com" }), // Thay bằng email người dùng thực tế
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to disable 2FA");
      setIs2FAEnabled(false);
      localStorage.setItem("is2FAEnabled", "false");
      toast.success("Tắt 2FA thành công", { autoClose: 1000, transition: Slide, position: "bottom-right" });
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message || "Không thể tắt 2FA"}`, { autoClose: 1500, transition: Slide, position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  }
};

// ... (giữ nguyên các phần khác không thay đổi)

  const checkEmailExists = async (email: string): Promise<boolean> => {
    setIsCheckingEmail(true);
    setEmailSuccess("");
    try {
      const response = await fetch(`${SETTINGS.URL_API}/v1/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Email không tồn tại");
      setEmailSuccess("Email hợp lệ, sẵn sàng gửi mã OTP");
      return true;
    } catch (error: any) {
      setEmailError("Email đăng ký không đúng");
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SETTINGS.URL_API}/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, action: "verify" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Mã OTP không đúng");
      setOtpError("");
      return true;
    } catch (error: any) {
      setOtpError(error.message || "Mã OTP không đúng");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!email || !validateEmail(email)) return;

    const emailExists = await checkEmailExists(email);
    if (!emailExists) return;

    setIsLoading(true);
    setResendDisabled(true);
    try {
      const response = await fetch(`${SETTINGS.URL_API}/v1/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể gửi OTP");
      toast.success("Mã OTP đã được gửi đến email của bạn.", { autoClose: 1500, transition: Slide });
      setStep("otp");
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message || "Không thể gửi OTP"}`, { autoClose: 1500, transition: Slide });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    await handleRequestOTP();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "email") {
      await handleRequestOTP();
    } else if (step === "otp") {
      if (!otp) {
        setOtpError("Vui lòng nhập mã OTP để xác thực.");
        return;
      }
      const isValidOtp = await verifyOtp(email, otp);
      if (!isValidOtp) return;
      setStep("newPassword");
    } else if (step === "newPassword") {
      if (!newPassword || !confirmPassword || !currentPassword || !email || !otp) {
        toast.error("Vui lòng cung cấp đầy đủ thông tin.", { autoClose: 1500, transition: Slide });
        return;
      }
      if (!validatePassword(newPassword)) {
        toast.error("Mật khẩu mới phải chứa ít nhất 8 ký tự, bao gồm chữ cái và số.", { autoClose: 1500, transition: Slide });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.", { autoClose: 1500, transition: Slide });
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${SETTINGS.URL_API}/v1/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, currentPassword, newPassword, confirmPassword, action: "change" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Không thể đổi mật khẩu");
        toast.success("Đổi mật khẩu thành công!", { autoClose: 1500, transition: Slide });
        setStep("confirmLogout");
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message || "Không thể đổi mật khẩu"}`, { autoClose: 1500, transition: Slide });
        console.log("Error details:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const newOtp = [...otp.split("")];
    newOtp[index] = value;
    setOtp(newOtp.join(""));
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
    if (newOtp.join("").length === 6) {
      if (step === "verify2FA") {
        handleVerify2FA();
      } else {
        const isValid = await verifyOtp(email, newOtp.join(""));
        if (!isValid) {
          setOtpError("Mã OTP không đúng");
        } else {
          setOtpError("");
          setStep("newPassword");
        }
      }
    }
  };

  const handleConfirmLogout = (logout: boolean) => {
    if (logout) {
      window.location.href = "/login";
    } else {
      setStep("email");
      setEmail("");
      setOtp("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEmailError("");
      setEmailSuccess("");
      setOtpError("");
    }
  };

  const tabs = [
    { id: "appearance", label: "Giao diện", icon: <Sun size={20} /> },
    { id: "notifications", label: "Thông báo", icon: <Bell size={20} /> },
    { id: "security", label: "Bảo mật", icon: <Lock size={20} /> },
  ];

  const variants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <style jsx>{`
        .custom-input-font:not(:placeholder-shown) {
          font-family: "Inter", sans-serif;
          font-size: 16px;
          line-height: 1.5;
        }
        .custom-input-font::placeholder {
          font-family: inherit;
        }
        .dark .custom-input-font::placeholder {
          font-family: inherit;
        }
      `}</style>

      <ToastContainer />
      <div className="flex items-center justify-center mb-8">
        <SettingsIcon size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Cài đặt</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
              activeTab === tab.id
                ? "bg-black text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
        {activeTab === "appearance" && (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <Sun size={24} className="text-amber-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Giao diện</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "light", label: "Sáng", desc: "Giao diện tươi sáng", icon: <Sun size={24} /> },
                { id: "dark", label: "Tối", desc: "Giao diện tối giản", icon: <Moon size={24} /> },
                { id: "system", label: "Hệ thống", desc: "Theo hệ điều hành", icon: <Monitor size={24} /> },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleThemeChange(option.id as Theme)}
                  className={`p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 transition-all duration-200 ${
                    theme === option.id
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div
                    className={`p-3 rounded-full mb-3 ${
                      theme === option.id
                        ? "bg-blue-100 dark:bg-blue-800"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {option.icon}
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{option.label}</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <Bell size={24} className="text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Thông báo</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
                    <Mail size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Thông báo qua Email</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nhận thông tin cập nhật qua email đã đăng ký</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={(e) => handleToggleNotification("email", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full mr-3">
                    <AlertCircle size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Thông báo trình duyệt</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hiển thị thông báo ngay trên trình duyệt của bạn</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={browserNotifications}
                    onChange={(e) => handleToggleNotification("browser", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <Lock size={24} className="text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Bảo mật</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <ShieldCheck size={20} className="text-green-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Xác thực hai yếu tố (2FA)</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Bảo vệ tài khoản của bạn bằng lớp xác thực thứ hai ngoài mật khẩu
                </p>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Bật xác thực hai yếu tố</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={is2FAEnabled}
                      onChange={(e) => handleToggle2FA(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <AnimatePresence mode="wait">
                  {step === "setup2FA" && (
                    <motion.div
                      key="setup2FA"
                      variants={variants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-6"
                    >
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Quét mã QR sau bằng ứng dụng xác thực (Google Authenticator, Authy, v.v.):
                        </p>
                        {qrCode && <QRCodeSVG value={qrCode} size={200} className="mx-auto" />}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                          Hoặc sử dụng mã bí mật thủ công: <strong>{secret}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => setStep("verify2FA")}
                        className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                      >
                        Tiếp tục
                      </button>
                    </motion.div>
                  )}
                  {step === "verify2FA" && (
                    <motion.div
                      key="verify2FA"
                      variants={variants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nhập mã OTP từ ứng dụng</label>
                        <div className="flex justify-center gap-2">
                          {Array.from({ length: 6 }, (_, index) => (
                            <input
                              key={index}
                              type="text"
                              value={otp[index] || ""}
                              onChange={(e) => handleOtpChange(e, index)}
                              ref={(el) => { otpInputRefs.current[index] = el; }}
                              maxLength={1}
                              className="custom-input-font w-12 h-12 text-center text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleVerify2FA}
                          disabled={isLoading || otp.length < 6}
                          className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin mr-2 inline" size={20} />
                              Đang xác thực...
                            </>
                          ) : "Xác nhận"}
                        </button>
                        <button
                          onClick={() => {
                            setStep("setup2FA");
                            setOtp("");
                            setOtpError("");
                          }}
                          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                        >
                          Quay lại
                        </button>
                      </div>
                      {otpError && (
                        <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                          <AlertTriangle size={16} className="text-red-700 dark:text-red-300 mr-2" />
                          <p className="text-sm text-red-700 dark:text-red-300">{otpError}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <Key size={20} className="text-amber-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Đổi mật khẩu</h3>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === "email" && (
                      <motion.div
                        key="email"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email đã đăng ký</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError("");
                                setEmailSuccess("");
                              }}
                              className={`custom-input-font w-full px-4 py-2 rounded-lg border ${
                                emailError ? "border-red-500" : emailSuccess ? "border-green-500" : "border-gray-300 dark:border-gray-600"
                              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10 text-base leading-6`}
                              placeholder="Nhập email đã đăng ký"
                              required
                            />
                            {email && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEmail("");
                                  setEmailError("");
                                  setEmailSuccess("");
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                          {emailSuccess && (
                            <p className="text-sm text-green-500 mt-1 flex items-center">
                              <CheckCircle size={16} className="mr-1" />
                              {emailSuccess}
                            </p>
                          )}
                          {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={isLoading || isCheckingEmail}
                            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                          >
                            {isCheckingEmail ? (
                              <>
                                <Loader2 className="animate-spin mr-2 inline" size={20} />
                                Đang kiểm tra email...
                              </>
                            ) : isLoading ? (
                              <>
                                <Loader2 className="animate-spin mr-2 inline" size={20} />
                                Đang gửi...
                              </>
                            ) : (
                              "Gửi mã OTP"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab("security")}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                          >
                            Hủy
                          </button>
                        </div>
                        <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <AlertCircle size={16} className="text-blue-700 dark:text-blue-300 mr-2" />
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Nhập email đã đăng ký để bắt đầu đổi mật khẩu. Một mã OTP sẽ được gửi đến bạn.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {step === "otp" && (
                      <motion.div
                        key="otp"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nhập mã OTP</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Mã của bạn đã được gửi đến email <strong className="text-blue-600 dark:text-blue-400">{email}</strong>
                          </p>
                          <div className="flex justify-center gap-2">
                            {Array.from({ length: 6 }, (_, index) => (
                              <input
                                key={index}
                                type="text"
                                value={otp[index] || ""}
                                onChange={(e) => handleOtpChange(e, index)}
                                ref={(el) => { otpInputRefs.current[index] = el; }}
                                maxLength={1}
                                className="custom-input-font w-12 h-12 text-center text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resendDisabled}
                            className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <RefreshCw size={16} className="mr-1" />
                            {resendDisabled ? "Gửi lại" : "Gửi lại mã"}
                          </button>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {resendDisabled ? `${resendTimer}s` : ""}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleChangePassword}
                            disabled={isLoading || otp.length < 6}
                            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="animate-spin mr-2 inline" size={20} />
                                Đang xác thực...
                              </>
                            ) : (
                              "Xác nhận"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                          >
                            Quay lại
                          </button>
                        </div>
                        {otpError && (
                          <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertTriangle size={16} className="text-red-700 dark:text-red-300 mr-2" />
                            <p className="text-sm text-red-700 dark:text-red-300">{otpError}</p>
                          </div>
                        )}
                        <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <AlertTriangle size={16} className="text-yellow-700 dark:text-yellow-300 mr-2" />
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Mã OTP có hiệu lực trong 5 phút. Nếu không nhận được, nhấn "Gửi lại mã".
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {step === "newPassword" && (
                      <motion.div
                        key="newPassword"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu hiện tại</label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="custom-input-font w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10 text-base leading-6"
                              placeholder="Nhập mật khẩu hiện tại"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="custom-input-font w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10 text-base leading-6"
                              placeholder="Tối thiểu 8 ký tự, có chữ và số"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xác nhận mật khẩu mới</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="custom-input-font w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pr-10 text-base leading-6"
                              placeholder="Nhập lại mật khẩu mới"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleChangePassword}
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="animate-spin mr-2 inline" size={20} />
                                Đang cập nhật...
                              </>
                            ) : (
                              "Đổi mật khẩu"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setStep("otp")}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                          >
                            Quay lại
                          </button>
                        </div>
                        <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <AlertTriangle size={16} className="text-yellow-700 dark:text-yellow-300 mr-2" />
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ cái và số.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {step === "confirmLogout" && (
                      <motion.div
                        key="confirmLogout"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-6 text-center"
                      >
                        <div className="p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-lg font-medium text-green-700 dark:text-green-300">
                            Đổi mật khẩu thành công!
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Bạn có muốn đăng xuất để đăng nhập lại với mật khẩu mới không?
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleConfirmLogout(true)}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all flex items-center justify-center"
                          >
                            <LogOut size={20} className="mr-2" />
                            Đăng xuất
                          </button>
                          <button
                            onClick={() => handleConfirmLogout(false)}
                            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                          >
                            Duy trì đăng nhập
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsSection;
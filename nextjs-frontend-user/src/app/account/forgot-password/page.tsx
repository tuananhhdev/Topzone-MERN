"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff,
  X,
  Loader2,
  Key,
  UserCheck,
} from "lucide-react";
import { SETTINGS } from "@/config/settings";

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "newPassword" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  useEffect(() => {
    if (step === "success") {
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [step, router]);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    setIsLoading(true);
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
      setIsLoading(false);
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
      toast.success("Mã OTP đã được gửi đến email của bạn.", {
        autoClose: 1500,
        transition: Slide,
      });
      setStep("otp");
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message || "Không thể gửi OTP"}`, {
        autoClose: 1500,
        transition: Slide,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
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
      toast.success("Mã OTP đã được gửi lại!", { autoClose: 1500, transition: Slide });
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message || "Không thể gửi OTP"}`, {
        autoClose: 1500,
        transition: Slide,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng cung cấp đầy đủ thông tin.", {
        autoClose: 1500,
        transition: Slide,
      });
      return;
    }
    if (!validatePassword(newPassword)) {
      toast.error("Mật khẩu mới phải chứa ít nhất 8 ký tự, bao gồm chữ cái và số.", {
        autoClose: 1500,
        transition: Slide,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.", {
        autoClose: 1500,
        transition: Slide,
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${SETTINGS.URL_API}/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
          confirmPassword,
          action: "change",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể đổi mật khẩu");
      toast.success("Đổi mật khẩu thành công!", { autoClose: 1500, transition: Slide });
      setStep("success");
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message || "Không thể đổi mật khẩu"}`, {
        autoClose: 1500,
        transition: Slide,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const newOtp = [...otp.split("")];
    newOtp[index] = value;
    setOtp(newOtp.join(""));
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
    if (newOtp.join("").length === 6) {
      const isValid = await verifyOtp(email, newOtp.join(""));
      if (isValid) {
        setStep("newPassword");
      }
    }
  };

  const steps = [
    { id: "email", label: "Email", icon: <Mail size={20} /> },
    { id: "otp", label: "OTP", icon: <UserCheck size={20} /> },
    { id: "newPassword", label: "Mật khẩu", icon: <Key size={20} /> },
    { id: "success", label: "Hoàn tất", icon: <CheckCircle size={20} /> },
  ];
  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const variants = {
    container: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } },
    },
    element: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } },
    },
    button: {
      whileHover: { scale: 1.05, transition: { duration: 0.2 } },
      whileTap: { scale: 0.95 },
    },
    stepIcon: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    },
    progressLine: {
      initial: { width: "0%" },
      animate: { width: "100%", transition: { duration: 0.5, ease: "easeOut" } },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <ToastContainer position="top-right" />
      <motion.div
        variants={variants.container}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative w-full max-w-lg p-8 mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
      >
        {/* Step Timeline */}
        <div className="mb-8">
          <div className="relative flex justify-between items-center">
            {steps.map((s, index) => (
              <div key={s.id} className="flex flex-col items-center relative z-10">
                <motion.div
                  variants={variants.stepIcon}
                  initial="initial"
                  animate={index <= currentStepIndex ? "animate" : "initial"}
                  className={`w-12 h-12 flex items-center justify-center rounded-full border-2 ${
                    index <= currentStepIndex
                      ? "bg-black text-white border-black"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                  } transition-all duration-300`}
                >
                  {s.icon}
                </motion.div>
                <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <motion.div
                    variants={variants.progressLine}
                    initial="initial"
                    animate={index < currentStepIndex ? "animate" : "initial"}
                    className={`absolute top-6 left-1/2 w-full h-1 bg-black z-0 ${
                      index >= currentStepIndex ? "bg-gray-300 dark:bg-gray-600" : ""
                    }`}
                    style={{ transform: "translateX(50%)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <motion.div variants={variants.element} className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {step === "success" ? "Thành công!" : "Quên Mật Khẩu"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {step === "email" && "Nhập email để nhận mã OTP."}
            {step === "otp" && "Nhập mã OTP đã gửi đến email của bạn."}
            {step === "newPassword" && "Đặt mật khẩu mới cho tài khoản của bạn."}
            {step === "success" && "Mật khẩu đã được đặt lại. Đang chuyển hướng..."}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.div
              key="email"
              variants={variants.element}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail size={20} className="text-gray-500 dark:text-gray-400" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                      setEmailSuccess("");
                    }}
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    placeholder="email@example.com"
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
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-500 mt-2 flex items-center"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    {emailSuccess}
                  </motion.p>
                )}
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 mt-2 flex items-center"
                  >
                    <AlertTriangle size={16} className="mr-1" />
                    {emailError}
                  </motion.p>
                )}
              </div>
              <motion.button
                variants={variants.button}
                whileHover="whileHover"
                whileTap="whileTap"
                onClick={handleRequestOTP}
                disabled={isLoading}
                className="w-full px-6 py-3 rounded-lg bg-black text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 inline" size={20} />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi mã OTP"
                )}
              </motion.button>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              variants={variants.element}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nhập mã OTP
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Mã đã được gửi đến{" "}
                  <strong className="text-black dark:text-white">{email}</strong>
                </p>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 6 }, (_, index) => (
                    <motion.input
                      key={index}
                      type="text"
                      value={otp[index] || ""}
                      onChange={(e) => handleOtpChange(e, index)}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      maxLength={1}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="w-12 h-12 text-center text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <motion.button
                  onClick={handleResendOTP}
                  disabled={resendDisabled}
                  className="flex items-center text-sm text-black dark:text-gray-300 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                  whileHover={{ x: 5 }}
                >
                  <RefreshCw size={16} className="mr-1" />
                  {resendDisabled ? "Gửi lại" : "Gửi lại mã"}
                </motion.button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {resendDisabled ? `${resendTimer}s` : ""}
                </span>
              </div>
              {otpError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <AlertTriangle size={16} className="text-red-700 dark:text-red-300 mr-2" />
                  <p className="text-sm text-red-700 dark:text-red-300">{otpError}</p>
                </motion.div>
              )}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep("email")}
                  variants={variants.button}
                  whileHover="whileHover"
                  whileTap="whileTap"
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Quay lại
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "newPassword" && (
            <motion.div
              key="newPassword"
              variants={variants.element}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 with-all pl-3 flex items-center">
                    <Lock size={20} className="text-gray-500 dark:text-gray-400" />
                  </span>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock size={20} className="text-gray-500 dark:text-gray-400" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
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
                <motion.button
                  variants={variants.button}
                  whileHover="whileHover"
                  whileTap="whileTap"
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="w-full px-6 py-3 rounded-lg bg-black text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 inline" size={20} />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </motion.button>
                <motion.button
                  variants={variants.button}
                  whileHover="whileHover"
                  whileTap="whileTap"
                  onClick={() => setStep("otp")}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Quay lại
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              variants={variants.element}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle size={64} className="text-green-500 mx-auto" />
              </motion.div>
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Mật khẩu đã được đặt lại thành công!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Đang chuyển hướng về trang đăng nhập...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
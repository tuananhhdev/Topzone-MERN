"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { SETTINGS } from "@/config/settings";
import { useAuthStore } from "@/stores/useAuth";
import { motion } from "framer-motion";
import Image from "next/image";
import googleIcon from "../../../public/google-icons.png";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const login = useAuthStore((state) => state.login);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Lấy thông tin từ localStorage khi component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedPassword) {
      formik.setValues({
        email: savedEmail,
        password: savedPassword,
      });
      setRememberMe(true);
    }
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Vui lòng nhập email")
      .email("Email không hợp lệ"),
    password: Yup.string()
      .required("Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const response = await axios.post(
          `${SETTINGS.URL_API}/v1/customers/login`,
          values
        );
        const data = response.data;

        await login(data.accessToken, data.refreshToken);

        // Lưu thông tin nếu rememberMe được chọn
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", values.email);
          localStorage.setItem("rememberedPassword", values.password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        toast.success("Đăng nhập thành công!", {
          position: "bottom-right",
          autoClose: 1000,
        });
        router.push("/");
      } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        toast.error("Thông tin đăng nhập không hợp lệ!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Nút Google Login chỉ để hiển thị giao diện
  const handleGoogleLogin = () => {
    toast.info("Chức năng đăng nhập bằng Google chưa được triển khai!", {
      position: "bottom-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden">
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 sm:p-8 mx-4 bg-white rounded-2xl shadow-xl"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Đăng Nhập
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.
          </p>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          <div>
            <label
              htmlFor="email"
              className="block text-base font-medium text-gray-700"
            >
              Email
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail size={20} className="text-gray-500" />
              </span>
              <input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                placeholder="email@example.com"
                aria-invalid={
                  formik.touched.email && formik.errors.email ? "true" : "false"
                }
                aria-describedby="email-error"
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                id="email-error"
                className="mt-2 text-sm text-red-600 flex items-center border-l-4 border-red-600 pl-2"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formik.errors.email}
              </motion.p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-base font-medium text-gray-700"
            >
              Mật Khẩu
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock size={20} className="text-gray-500" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...formik.getFieldProps("password")}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                placeholder="••••••"
                aria-invalid={
                  formik.touched.password && formik.errors.password
                    ? "true"
                    : "false"
                }
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-500" />
                ) : (
                  <Eye size={20} className="text-gray-500" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                id="password-error"
                className="mt-2 text-sm text-red-600 flex items-center border-l-4 border-red-600 pl-2"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formik.errors.password}
              </motion.p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  aria-label="Lưu thông tin đăng nhập"
                />
                <span className="ml-2 text-base text-gray-700">
                  Lưu thông tin đăng nhập
                </span>
              </label>
            </div>
            <Link
              href="/account/forgot-password"
              className="text-base font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <motion.button
            type="submit"
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{ scale: 0.97 }}
            className={`w-full px-6 py-4 rounded-xl text-white text-base font-semibold transition-all duration-300 ${
              !formik.dirty || !formik.isValid || formik.isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#101010] to-[#1a1a1a] hover:from-[#1a1a1a] hover:to-[#101010] hover:shadow-lg"
            }`}
            disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
            aria-label="Đăng nhập"
          >
            {formik.isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang xử lý...
              </>
            ) : (
              "Đăng Nhập"
            )}
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogleLogin}
            className="w-full px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 text-base font-semibold shadow-md transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg flex items-center justify-center"
            aria-label="Đăng nhập bằng Google"
          >
            <Image
              src={googleIcon}
              alt="Google Icon"
              width={24}
              height={24}
              className="mr-3"
              style={{ objectFit: "contain" }}
            />
            Đăng nhập bằng Google
          </motion.button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-base text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="inline-flex items-center text-base font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Đăng ký ngay
              <ArrowRight size={18} className="ml-1" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;

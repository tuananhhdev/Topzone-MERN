"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { SETTINGS } from "@/config/settings";
import { TCustomer } from "@/types/modes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Checkbox } from "@mantine/core";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const inputVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  focus: { scale: 1.05 },
};

const errorVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Vui lòng nhập email")
      .email("Email không hợp lệ"),
    full_name: Yup.string().required("Vui lòng nhập họ và tên"),
    phone_number: Yup.string()
      .required("Vui lòng nhập số điện thoại")
      .matches(/^\d{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),
    password: Yup.string()
      .required("Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    re_pass: Yup.string()
      .required("Vui lòng nhập lại mật khẩu")
      .oneOf([Yup.ref("password")], "Mật khẩu nhập lại không khớp"),
  });

  const checkEmailExists = async (email: string) => {
    try {
      const resCustomer = await fetch(`${SETTINGS.URL_API}/v1/customers`);
      if (!resCustomer.ok) {
        throw new Error(`Lỗi khi gọi API: ${resCustomer.statusText}`);
      }
      const dataCustomer = await resCustomer.json();
      if (!dataCustomer || !Array.isArray(dataCustomer.customers_list)) {
        throw new Error("Dữ liệu API không đúng định dạng mong đợi");
      }
      const listCustomer = dataCustomer.customers_list;
      return listCustomer.some(
        (customer: TCustomer) => customer.email === email
      );
    } catch (error) {
      console.error("Lỗi kiểm tra email:", error);
      toast.error("Không thể kiểm tra email, vui lòng thử lại!", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return false;
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      full_name: "",
      phone_number: "",
      password: "",
      re_pass: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      const customer = {
        email: values.email,
        full_name: values.full_name,
        phone: values.phone_number,
        password: values.password,
        remember_me: rememberMe,
      };

      const emailExists = await checkEmailExists(customer.email);
      if (emailExists) {
        toast.error("Email này đã được đăng ký!", {
          position: "top-right",
          autoClose: 3000,
        });
        setSubmitting(false);
        return;
      }

      try {
        const resNewCustomer = await fetch(`${SETTINGS.URL_API}/v1/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customer),
        });

        const dataNewCustomer = await resNewCustomer.json();

        if (!resNewCustomer.ok) {
          toast.error(dataNewCustomer.error || "Đã có lỗi xảy ra!", {
            position: "bottom-right",
            autoClose: 3000,
          });
        } else {
          // Lưu refresh-token nếu "Ghi nhớ tôi" được chọn
          if (rememberMe && dataNewCustomer.refresh_token) {
            localStorage.setItem(
              "refresh_token",
              dataNewCustomer.refresh_token
            );
          } else {
            localStorage.removeItem("refresh_token"); // Xóa nếu không chọn "Ghi nhớ tôi"
          }
          resetForm();
          toast.success("Đăng ký tài khoản thành công", {
            position: "bottom-right",
            autoClose: 1000,
          });
            router.push("/login");
        }
      } catch (error) {
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      <ToastContainer />
      <motion.div
        className="w-full h-screen flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md p-6 sm:p-8 rounded-xl shadow-lg bg-white overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Đăng Ký
            </h2>
            <Link
              href="/login"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-all"
            >
              <ArrowLeft size={16} className="mr-1" />
              Quay lại đăng nhập
            </Link>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <motion.div
                className="mt-1 relative"
                variants={inputVariants}
                initial="rest"
                whileHover="hover"
                whileFocus="focus"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail size={18} className="text-gray-400" />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...formik.getFieldProps("email")}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 transition-all font-inter"
                  placeholder="email@example.com"
                />
              </motion.div>
              {formik.touched.email && formik.errors.email && (
                <motion.p
                  className="mt-1 text-sm text-red-600"
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {formik.errors.email}
                </motion.p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700"
              >
                Họ và Tên
              </label>
              <motion.div
                className="mt-1 relative"
                variants={inputVariants}
                initial="rest"
                whileHover="hover"
                whileFocus="focus"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User size={18} className="text-gray-400" />
                </span>
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  {...formik.getFieldProps("full_name")}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 transition-all font-inter"
                  placeholder="Nguyễn Văn A"
                />
              </motion.div>
              {formik.touched.full_name && formik.errors.full_name && (
                <motion.p
                  className="mt-1 text-sm text-red-600"
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {formik.errors.full_name}
                </motion.p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700"
              >
                Số Điện Thoại
              </label>
              <motion.div
                className="mt-1 relative"
                variants={inputVariants}
                initial="rest"
                whileHover="hover"
                whileFocus="focus"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone size={18} className="text-gray-400" />
                </span>
                <input
                  id="phone_number"
                  type="tel"
                  autoComplete="tel"
                  {...formik.getFieldProps("phone_number")}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 transition-all font-inter"
                  placeholder="0362472694"
                />
              </motion.div>
              {formik.touched.phone_number && formik.errors.phone_number && (
                <motion.p
                  className="mt-1 text-sm text-red-600"
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {formik.errors.phone_number}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mật Khẩu
              </label>
              <motion.div
                className="mt-1 relative"
                variants={inputVariants}
                initial="rest"
                whileHover="hover"
                whileFocus="focus"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={18} className="text-gray-400" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...formik.getFieldProps("password")}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 transition-all font-inter"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </motion.div>
              {formik.touched.password && formik.errors.password && (
                <motion.p
                  className="mt-1 text-sm text-red-600"
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {formik.errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="re_pass"
                className="block text-sm font-medium text-gray-700"
              >
                Xác nhận Mật Khẩu
              </label>
              <motion.div
                className="mt-1 relative"
                variants={inputVariants}
                initial="rest"
                whileHover="hover"
                whileFocus="focus"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={18} className="text-gray-400" />
                </span>
                <input
                  id="re_pass"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...formik.getFieldProps("re_pass")}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 transition-all font-inter"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </motion.div>
              {formik.touched.re_pass && formik.errors.re_pass && (
                <motion.p
                  className="mt-1 text-sm text-red-600"
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {formik.errors.re_pass}
                </motion.p>
              )}
            </div>

            <div>
              <Checkbox
                id="remember_me"
                label="Ghi nhớ tôi"
                color="pink"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.currentTarget.checked)}
                className="cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg flex items-center justify-center font-semibold ${
                !formik.dirty || !formik.isValid || formik.isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white"
              }`}
              disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <>
                  <motion.svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
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
                  </motion.svg>
                  Đang xử lý...
                </>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterForm;

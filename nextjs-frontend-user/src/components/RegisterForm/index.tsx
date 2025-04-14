"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { SETTINGS } from "@/config/settings";
import { TCustomer } from "@/types/modes";

const RegisterForm = () => {
  const [msgError, setMsgError] = useState("");
  const [msgSucess, setMsgSucess] = useState("");
  const router = useRouter();

  const validationSchema = Yup.object({
    email: Yup.string().required("Vui lòng nhập email").email("Email không hợp lệ"),
    last_name: Yup.string().required("Vui lòng nhập họ"),
    first_name: Yup.string().required("Vui lòng nhập tên"),
    phone_number: Yup.string()
      .required("Vui lòng nhập số điện thoại")
      .matches(/^\d+$/, "Số điện thoại chỉ chứa chữ số"),
    password: Yup.string().required("Vui lòng nhập mật khẩu").min(4, "Mật khẩu có ít nhất 4 ký tự"),
    re_pass: Yup.string()
      .required("Vui lòng nhập lại mật khẩu")
      .oneOf([Yup.ref("password")], "Mật khẩu nhập lại không khớp"),
    street: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    zip_code: Yup.string(),
  });

  const checkEmailExists = async (email: string) => {
    const resCustomer = await fetch(`${SETTINGS.URL_API}/v1/customers`);
    const dataCustomer = await resCustomer.json();
    const listCustomer = dataCustomer.data.customers_list;
    const existingUser = listCustomer.find((customer: TCustomer) => customer.email === email);

    if (existingUser) {
      return true;
    }
    return false;
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      last_name: "",
      first_name: "",
      phone_number: "",
      password: "",
      re_pass: "",
      street: "",
      city: "",
      state: "",
      zip_code: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      console.log("Form Data Submitted:", values);
      setSubmitting(false);
      const customer = {
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone_number,
        password: values.password,
      };
      const emailExists = await checkEmailExists(customer.email);

      if (emailExists) {
        setMsgError("Email này đã được đăng ký!");
        return;
      }

      const resNewCustomer = await fetch(`${SETTINGS.URL_API}/v1/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });

      const dataNewCustomer = await resNewCustomer.json();

      if (!resNewCustomer.ok) {
        setMsgError(dataNewCustomer.error || "Đã có lỗi xảy ra!");
      } else {
        resetForm();
        setMsgError("");
        setMsgSucess("Bạn đã đăng ký tài khoản thành công");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    },
  });

  return (
    <div className="my-[55px] flex items-center justify-center bg-gray-100">
      {" "}
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
        {" "}
        <h2 className="mb-6 text-center text-2xl font-semibold">Đăng Ký</h2>{" "}
        {msgSucess && (
          <div
            className="mb-3 rounded border border-blue-400 bg-blue-100 px-4 py-3 text-blue-700"
            role="alert"
          >
            {msgSucess}
          </div>
        )}
        {msgError != "" && (
          <div className="text-danger validation-summary-valid" data-valmsg-summary="true">
            {msgError}
          </div>
        )}
        <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-4">
          {" "}
          {/* Email */}{" "}
          <div className="col-span-2">
            {" "}
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>{" "}
            <input
              id="email"
              type="email"
              {...formik.getFieldProps("email")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
            {formik.touched.email && formik.errors.email ? (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            ) : null}{" "}
          </div>{" "}
          {/* Last Name */}{" "}
          <div>
            {" "}
            <label htmlFor="last_name" className="block text-sm font-medium">
              Họ
            </label>{" "}
            <input
              id="last_name"
              type="text"
              {...formik.getFieldProps("last_name")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
            {formik.touched.last_name && formik.errors.last_name ? (
              <p className="text-sm text-red-500">{formik.errors.last_name}</p>
            ) : null}{" "}
          </div>{" "}
          {/* First Name */}{" "}
          <div>
            {" "}
            <label htmlFor="first_name" className="block text-sm font-medium">
              Tên
            </label>{" "}
            <input
              id="first_name"
              type="text"
              {...formik.getFieldProps("first_name")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
            {formik.touched.first_name && formik.errors.first_name ? (
              <p className="text-sm text-red-500">{formik.errors.first_name}</p>
            ) : null}{" "}
          </div>{" "}
          {/* Phone Number */}{" "}
          <div>
            {" "}
            <label htmlFor="phone_number" className="block text-sm font-medium">
              Số Điện Thoại
            </label>{" "}
            <input
              id="phone_number"
              type="text"
              {...formik.getFieldProps("phone_number")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
            {formik.touched.phone_number && formik.errors.phone_number ? (
              <p className="text-sm text-red-500">{formik.errors.phone_number}</p>
            ) : null}{" "}
          </div>{" "}
          {/* Password */}{" "}
          <div>
            {" "}
            <label htmlFor="password" className="block text-sm font-medium">
              Mật Khẩu
            </label>{" "}
            <input
              id="password"
              type="password"
              {...formik.getFieldProps("password")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
            {formik.touched.password && formik.errors.password ? (
              <p className="text-sm text-red-500">{formik.errors.password}</p>
            ) : null}{" "}
          </div>{" "}
          {/* Confirm Password */}{" "}
          <div className="col-span-2">
            {" "}
            <label htmlFor="re_pass" className="block text-sm font-medium">
              Nhập Lại Mật Khẩu
            </label>{" "}
            <input
              id="re_pass"
              type="password"
              {...formik.getFieldProps("re_pass")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
            {formik.touched.re_pass && formik.errors.re_pass ? (
              <p className="text-sm text-red-500">{formik.errors.re_pass}</p>
            ) : null}{" "}
          </div>{" "}
          {/* Street */}{" "}
          <div className="col-span-2">
            {" "}
            <label htmlFor="street" className="block text-sm font-medium">
              Đường
            </label>{" "}
            <input
              id="street"
              type="text"
              {...formik.getFieldProps("street")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
          </div>{" "}
          {/* City */}{" "}
          <div>
            {" "}
            <label htmlFor="city" className="block text-sm font-medium">
              Thành Phố
            </label>{" "}
            <input
              id="city"
              type="text"
              {...formik.getFieldProps("city")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
          </div>{" "}
          {/* State */}{" "}
          <div>
            {" "}
            <label htmlFor="state" className="block text-sm font-medium">
              Tỉnh/Bang
            </label>{" "}
            <input
              id="state"
              type="text"
              {...formik.getFieldProps("state")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
          </div>{" "}
          {/* ZIP Code */}{" "}
          <div className="col-span-2">
            {" "}
            <label htmlFor="zip_code" className="block text-sm font-medium">
              ZIP Code
            </label>{" "}
            <input
              id="zip_code"
              type="text"
              {...formik.getFieldProps("zip_code")}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />{" "}
          </div>{" "}
          <button
            type="submit"
            className={`col-span-2 w-full rounded-lg py-2.5 transition ${
              !formik.dirty || !formik.isValid || formik.isSubmitting
                ? "cursor-not-allowed bg-[#212121]/60"
                : "bg-[#212121] text-white hover:bg-[#212121]/90"
            }`}
            disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
          >
            {formik.isSubmitting ? "Submitting..." : "Đăng Ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;

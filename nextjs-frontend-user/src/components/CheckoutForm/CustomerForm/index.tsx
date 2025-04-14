"use client";

import React from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface FormData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  state: string;
  city: string;
  street: string;
  note?: string;
  payment_type: number;
}

interface CustomerFormProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ register, errors }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4">
      <h2 className="font-semibold text-lg">Người đặt hàng</h2>
      <input
        type="text"
        placeholder="Họ"
        {...register("last_name")} // Đổi thành last_name để phù hợp với dữ liệu
        name="last_name" // Thêm name để trình duyệt nhận diện
        autoComplete="family-name" // Gợi ý họ (last name)
        className="w-full border border-gray-300 rounded px-3 py-2"
      />
      {errors.last_name && (
        <p className="text-red-500 text-sm">{errors.last_name.message}</p>
      )}

      <input
        type="text"
        placeholder="Tên"
        {...register("first_name")}
        name="first_name" // Thêm name để trình duyệt nhận diện
        autoComplete="given-name" // Gợi ý tên (first name)
        className="w-full border border-gray-300 rounded px-3 py-2"
      />
      {errors.first_name && (
        <p className="text-red-500 text-sm">{errors.first_name.message}</p>
      )}

      <input
        type="tel"
        placeholder="Số điện thoại"
        {...register("phone")}
        name="phone" // Thêm name để trình duyệt nhận diện
        autoComplete="tel" // Gợi ý số điện thoại
        className="w-full border border-gray-300 rounded px-3 py-2"
      />
      {errors.phone && (
        <p className="text-red-500 text-sm">{errors.phone.message}</p>
      )}

      <input
        type="email"
        placeholder="Email (Không bắt buộc)"
        {...register("email")}
        name="email" // Thêm name để trình duyệt nhận diện
        autoComplete="email" // Gợi ý email
        className="w-full border border-gray-300 rounded px-3 py-2"
      />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}
    </div>
  );
};

export default CustomerForm;
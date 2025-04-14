import React from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import codMethod from "../../../public/image/payment-method/COD.png";
import vnpayMethod from "../../../public/image/payment-method/qr-code.png";
import momoMethod from "../../../public/image/payment-method/momo.png";

const PaymentMethod = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold text-lg mb-4">Phương thức thanh toán</h2>
      <div className="space-y-3">
        {/* Thanh toán khi nhận hàng */}
        <label className="flex items-center gap-3">
          <input
            type="radio"
            value={1}
            {...register("payment_type")}
            className="form-radio text-blue-500"
          />
          <span className="flex items-center gap-2">
            <span className="text-red-500">
              <Image
                src={codMethod}
                alt="VNPay"
                width={40} // Đặt chiều rộng
                height={40} // Đặt chiều cao
                className="object-contain"
              />
            </span>{" "}
            Thanh toán khi nhận hàng
          </span>
        </label>

        {/* Thanh toán bằng QR Code, thẻ ATM nội địa */}
        <label className="flex items-center gap-3">
          <input
            type="radio"
            value={2}
            {...register("payment_type")}
            className="form-radio text-blue-500"
          />
          <span className="flex items-center gap-2">
            <Image
              src={vnpayMethod}
              alt="VNPay"
              width={35} // Đặt chiều rộng
              height={35} // Đặt chiều cao
              className="object-contain"
            />
            Thanh toán bằng QR Code
          </span>
        </label>

        {/* Thanh toán MOMO */}
        <label className="flex items-center gap-3">
          <input
            type="radio"
            value={3}
            {...register("payment_type")}
            className="form-radio text-blue-500"
          />
          <span className="flex items-center gap-2">
            <span className="text-red-500">
              <Image
                src={momoMethod}
                alt="VNPay"
                width={35} // Đặt chiều rộng
                height={35} // Đặt chiều cao
                className="object-contain"
              />
            </span>{" "}
            Thanh toán bằng ví MoMo 
            Pay
          </span>
        </label>
      </div>

      {/* Hiển thị lỗi nếu không chọn phương thức thanh toán */}
      {errors.payment_type && errors.payment_type.message && (
        <p className="text-red-500 text-sm mt-2">
          {errors.payment_type.message}
        </p>
      )}
    </div>
  );
};

export default PaymentMethod;

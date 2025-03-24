import React from "react";
import { ShieldCheck, Truck, Repeat, BadgeCheck } from "lucide-react";

const benefits = [
  {
    id: 1,
    icon: <ShieldCheck size={36} className="text-red-500" />,
    title: "Thương hiệu đảm bảo",
    description: "Nhập khẩu, bảo hành chính hãng",
  },
  {
    id: 2,
    icon: <Truck size={36} className="text-red-500" />,
    title: "Đổi trả dễ dàng",
    description: "Theo chính sách đổi trả tại FPT Shop",
  },
  {
    id: 3,
    icon: <Repeat size={36} className="text-red-500" />,
    title: "Sản phẩm chất lượng",
    description: "Đảm bảo tương thích và độ bền cao",
  },
  {
    id: 4,
    icon: <BadgeCheck size={36} className="text-red-500" />,
    title: "Giao hàng tận nơi",
    description: "Tại 63 tỉnh thành",
  },
];

const BenefitsHome = () => {
  return (
    <div className="bg-[#101010] pt-6 rounded-2xl">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className="relative flex flex-col items-center text-center w-1/4 px-4"
            style={{ height: "160px" }} // Chiều cao cố định
          >
            {/* Icon với background bo tròn */}
            <div className="p-3 bg-white shadow-md rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-pointer">
              {benefit.icon}
            </div>

            {/* Tiêu đề */}
            <h3 className="text-lg font-semibold mt-3 text-white">
              {benefit.title}
            </h3>

            {/* Mô tả */}
            <p className="text-sm text-gray-300">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsHome;

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
    <div className="mb-8 rounded-2xl bg-[#101010] pt-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className="relative flex w-1/4 flex-col items-center px-4 text-center"
            style={{ height: "160px" }} // Chiều cao cố định
          >
            {/* Icon với background bo tròn */}
            <div className="flex cursor-pointer items-center justify-center rounded-2xl bg-white p-3 shadow-md transition-transform duration-300 hover:scale-110">
              {benefit.icon}
            </div>

            {/* Tiêu đề */}
            <h3 className="mt-3 text-lg font-semibold text-white">{benefit.title}</h3>

            {/* Mô tả */}
            <p className="text-sm text-gray-300">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsHome;

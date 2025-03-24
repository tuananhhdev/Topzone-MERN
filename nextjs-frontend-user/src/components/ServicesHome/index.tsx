import React from "react";
import {
  Gamepad2,
  Wifi,
  CreditCard,
  Droplets,
  Plug,
  MoreHorizontal,
} from "lucide-react";

const services = [
  {
    id: 1,
    icon: <Gamepad2 size={32} />,
    name: "Thẻ game",
    url: "/service/the-game",
  },
  { id: 2, icon: <Wifi size={32} />, name: "Đóng phí Internet" },
  { id: 3, icon: <CreditCard size={32} />, name: "Thanh toán trả góp" },
  { id: 4, icon: <Droplets size={32} />, name: "Tiền nước" },
  { id: 5, icon: <Plug size={32} />, name: "Tiền điện" },
  { id: 6, icon: <MoreHorizontal size={32} />, name: "Dịch vụ khác" },
];

const ServicesHome = () => {
  return (
    <div className="bg-[#101010] p-4 rounded-2xl shadow-md mb-8">
      <div className="flex items-center justify-between border-gray-200 rounded-lg ">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="relative flex flex-col items-center gap-2 w-full py-4"
          >
            {/* Icon */}
            <div className="p-3 bg-gray-100 border border-gray-300 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 text-rose-600 hover:scale-110 cursor-pointer">
              {service.icon}
            </div>

            {/* Tên dịch vụ */}
            <p className="text-sm font-medium text-white text-center">
              {service.name}
            </p>

            {/* Đường kẻ phân cách, không hiển thị với phần tử cuối */}
            {index !== services.length - 1 && (
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 h-10 w-px bg-gray-500"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesHome;

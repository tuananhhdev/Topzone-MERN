import React from "react";
import { Gamepad2, Wifi, CreditCard, Droplets, Plug, MoreHorizontal } from "lucide-react";

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
    <div className="mb-8 rounded-2xl bg-[#101010] p-4 shadow-md">
      <div className="flex items-center justify-between rounded-lg border-gray-200">
        {services.map((service, index) => (
          <div key={service.id} className="relative flex w-full flex-col items-center gap-2 py-4">
            {/* Icon */}
            <div className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-gray-100 p-3 text-rose-600 shadow-sm transition-all duration-300 hover:scale-110">
              {service.icon}
            </div>

            {/* Tên dịch vụ */}
            <p className="text-center text-sm font-medium text-white">{service.name}</p>

            {/* Đường kẻ phân cách, không hiển thị với phần tử cuối */}
            {index !== services.length - 1 && (
              <div className="absolute right-0 top-1/2 h-10 w-px -translate-y-1/2 transform bg-gray-500"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesHome;

import Image from "next/image";
import React from "react";

const SupportHome = () => {
  return (
    <div className="mb-8">
      <Image
        src="https://cdn2.fptshop.com.vn/unsafe/Desktop_H1_a3a66bdcf9.png"
        alt="Support Banner"
        width={1254} // Đặt chiều rộng theo đúng ảnh của bạn
        height={31} // Đặt chiều cao theo đúng ảnh của bạn
        quality={100}
        loading="lazy"
        className="w-full h-auto object-cover rounded-2xl"
      />
    </div>
  );
};

export default SupportHome;

import Image from "next/image";

const ProductPolicy = () => {
  return (
    <div className="border-t border-b border-gray-300 pt-5 pb-5">
      <h3 className="font-bold text-lg mb-2">Chính sách dành cho sản phẩm</h3>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <div className="flex items-center space-x-2">
          {/* <MdVerified className="text-red-500 text-xl" /> */}
          <Image
            src={`https://cdn2.fptshop.com.vn/svg/Type_Bao_hanh_chinh_hang_4afa1cb34d.svg?w=48&amp;q=10`}
            alt="verify_img"
            width={24}
            height={24}
            quality={80}
            loading="lazy"
          />
          <span>Hàng chính hãng - Bảo hành 12 tháng</span>
        </div>
        <div className="flex items-center space-x-2">
          <Image
            src={`https://cdn2.fptshop.com.vn/svg/Type_Giao_hang_toan_quoc_318e6896b4.svg?w=48&amp;q=100`}
            alt="verify_img"
            width={24}
            height={24}
            quality={80}
            loading="lazy"
          />
          <span>Giao hàng toàn quốc</span>
        </div>
        <div className="flex items-center space-x-2">
          <Image
            src={`https://cdn2.fptshop.com.vn/svg/Type_Cai_dat_21382ecc84.svg?w=48&amp;q=100`}
            alt="verify_img"
            width={24}
            height={24}
            quality={80}
            loading="lazy"
          />
          <span>Kỹ thuật viên hỗ trợ trực tuyến</span>
        </div>
      </div>
    </div>
  );
};

export default ProductPolicy;

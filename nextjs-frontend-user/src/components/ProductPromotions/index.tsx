import React from "react";
import { Gift, CreditCard } from "lucide-react";

const ProductPromotions = () => {
  return (
    <div className="border rounded-lg bg-gray-50">
      <div className="bg-[#F3F4F6] px-4 py-1 rounded-t-lg">
        <h4 className="font-semibold text-base mb-3 mt-2">
          Quà tặng và ưu đãi khác
        </h4>
      </div>
      <div className="p-5">
        <ul className="space-y-2">
          <li className="flex items-center gap-2 pb-1">
            <Gift className="w-5 h-5 text-gray-600" />
            <span className="text-sm">
              Tặng phiếu mua hàng <strong>50,000đ</strong> khi mua sim kèm
              máy{" "}
            </span>
          </li>
          <li className="flex items-center gap-2 border-t pt-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <span className="text-sm">
              Trả góp <strong>0% lãi suất</strong>, <strong>MIỄN PHÍ</strong>{" "}
              chuyển đổi kì hạn
              <strong> 3 - 6 tháng</strong> qua thẻ tín dụng
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProductPromotions;

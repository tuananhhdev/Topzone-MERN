import React from "react";
import { useRouter } from "next/navigation";
import "@smastrom/react-rating/style.css";
import { Rating } from "@smastrom/react-rating";

interface ReceivedModalProps {
  orderId: string;
  product: {
    product_name: string;
  };
  productId: string;
  onClose: () => void;
}

const ReceivedModal: React.FC<ReceivedModalProps> = ({
  orderId,
  product,
  productId,
  onClose,
}) => {
  const router = useRouter();

  const handleRating = (rate: number) => {
    console.log("Rating selected:", rate);
    router.push(`/orders/rating/${orderId}?pid=${productId}&rate=${rate}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">
          Xác nhận nhận hàng
        </h2>
        <p className="text-gray-300 mb-6">
          Bạn đã nhận được sản phẩm <strong>{product.product_name}</strong>?
        </p>
        <div className="mb-6">
          <p className="text-gray-300 mb-2">Đánh giá nhanh:</p>
          <div>
            <Rating value={0} onChange={handleRating} />
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => onClose()}
            className={`px-4 py-2 rounded-md text-white font-medium bg-[#101010] hover:bg-[#1f1f1f] transition duration-300 ease-in-out 
            `}
          >
            Đánh giá sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceivedModal;

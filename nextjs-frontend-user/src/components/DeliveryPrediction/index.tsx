import { SETTINGS } from "@/config/settings";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const DeliveryPrediction = ({ order }) => {

const {data: session} = useSession();

  const [prediction, setPrediction] = useState({
    minTime: null,
    maxTime: null,
    confidence: 0,
    factors: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        // Trong thực tế, bạn sẽ gọi API của mình
        const response = await axios.get(
          `${SETTINGS.URL_API}/v1/orders/${order._id}/delivery-prediction`,
          {
            headers: {
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
          }
        );

        setPrediction(response.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy dự đoán giao hàng:", error);
        // Thiết lập dữ liệu giả định để demo
        setPrediction({
          minTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 ngày sau
          maxTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 ngày sau
          confidence: 85,
          factors: [
            "Điều kiện thời tiết hiện tại",
            "Khoảng cách vận chuyển",
            "Lượng đơn hàng trong khu vực",
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    if (order && order.order_status >= 1 && order.order_status <= 4) {
      fetchPrediction();
    }
  }, [order, session]);

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-300">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-300">
      <h3 className="text-xl font-bold text-black mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Dự đoán thời gian giao hàng
      </h3>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">
            Độ chính xác dự đoán
          </span>
          <span className="text-sm font-bold text-black">
            {prediction.confidence}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-black h-2.5 rounded-full"
            style={{ width: `${prediction.confidence}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-base font-medium text-gray-700 mb-2">
          Dự kiến giao hàng trong khoảng:
        </p>
        <p className="text-2xl font-bold text-black">
          {prediction.minTime
            ? new Date(prediction.minTime).toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "numeric",
              })
            : ""}
          {" - "}
          {prediction.maxTime
            ? new Date(prediction.maxTime).toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "numeric",
              })
            : ""}
        </p>
      </div>

      {prediction.factors && prediction.factors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Các yếu tố ảnh hưởng:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 ml-2">
            {prediction.factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DeliveryPrediction;
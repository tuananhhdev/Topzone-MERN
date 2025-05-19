"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import { SETTINGS } from "@/config/settings";
import { Rating } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { AxiosError } from "axios";
import { formatToVND } from "@/helpers/formatPrice";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { ArrowLeft } from "lucide-react";

interface OrderItem {
  product_name: string;
  thumbnail: string;
  quantity: number;
  price_end: number;
  _id: string;
}

const RatingPage = () => {
  const { orderId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const productId = searchParams.get("pid") || "";
  const initialRate = Number(searchParams.get("rate")) || 0;

  const [product, setProduct] = useState<OrderItem | null>(null);
  const [rate, setRate] = useState(initialRate);
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const labels: { [index: number]: string } = {
    0.5: "Chất lượng rất kém",
    1: "Chưa đạt yêu cầu",
    1.5: "Dưới mức trung bình",
    2: "Cần cải thiện",
    2.5: "Trung bình",
    3: "Tạm ổn",
    3.5: "Khá hài lòng",
    4: "Hài lòng",
    4.5: "Rất hài lòng",
    5: "Hoàn toàn hài lòng",
  };

  const getLabelColor = (value: number) => {
    if (value <= 2) return "text-red-400";
    if (value <= 3) return "text-yellow-400";
    return "text-green-400";
  };

  useEffect(() => {
    console.log(
      "useEffect triggered, status:",
      status,
      "orderId:",
      orderId,
      "productId:",
      productId
    );
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (!productId) {
      setError("Thiếu productId trong query string");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        console.log(
          "Fetching product from:",
          `${SETTINGS.URL_API}/v1/orders/${orderId}`
        );
        const res = await axios.get(
          `${SETTINGS.URL_API}/v1/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
          }
        );
        console.log("API Response:", res.data);
        const order = res.data.data;
        const item = order.order_items.find(
          (item: OrderItem) => item._id === productId
        );
        if (!item) {
          throw new Error("Sản phẩm không tìm thấy trong đơn hàng");
        }
        setProduct(item);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<{ message?: string }>;
          console.error(
            "Fetch Error:",
            axiosError.response?.data || axiosError.message
          );
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Lỗi khi lấy dữ liệu sản phẩm";
          setError(errorMessage);
          if (axiosError.response?.status === 401) {
            toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
            router.push("/login");
          } else {
            toast.error(errorMessage);
          }
        } else if (err instanceof Error) {
          console.error("Fetch Error:", err.message);
          setError(err.message);
          toast.error(err.message);
        } else {
          console.error("Fetch Error:", err);
          setError("Lỗi không xác định khi lấy dữ liệu sản phẩm");
          toast.error("Lỗi không xác định khi lấy dữ liệu sản phẩm");
        }
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && orderId) {
      fetchProduct();
    } else {
      setLoading(false);
      if (!orderId) {
        setError("Thiếu orderId trong URL");
        toast.error("Thiếu orderId trong URL");
      }
    }
  }, [status, session, orderId, productId, router]);

  const handleRating = (
    event: React.SyntheticEvent,
    newValue: number | null
  ) => {
    const newRate = newValue || 0;
    console.log("Selected rating:", newRate);
    setRate(newRate);
  };

  const handleRatingHover = (
    event: React.SyntheticEvent,
    newHover: number | null
  ) => {
    setHover(newHover || -1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter((file) => {
        const isValidType = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "video/mp4",
        ].includes(file.type);
        const isValidSize = file.size <= 10 * 1024 * 1024;
        if (!isValidType) {
          toast.error(
            `File ${file.name} không đúng định dạng (chỉ chấp nhận hình ảnh và video MP4)`
          );
        }
        if (!isValidSize) {
          toast.error(`File ${file.name} vượt quá kích thước 10MB`);
        }
        return isValidType && isValidSize;
      });

      const totalFiles = files.length + validFiles.length;
      if (totalFiles > 5) {
        toast.error("Bạn chỉ có thể tải lên tối đa 5 file!");
        return;
      }

      setFiles([...files, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rate < 1 || rate > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5");
      return;
    }
    if (!orderId || !productId) {
      toast.error("Thiếu thông tin đơn hàng hoặc sản phẩm");
      return;
    }
  
    setSubmitting(true);
    try {
      let images: string[] = [];
      let videos: string[] = [];
  
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        const uploadRes = await axios.post(
          `${SETTINGS.URL_API}/v1/uploads/array-handle`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
          }
        );
        images = uploadRes.data.data.images || [];
        videos = uploadRes.data.data.videos || [];
      }
  
      const ratingUrl = `${SETTINGS.URL_API}/v1/orders/rating/${orderId}`;
      console.log("Submitting rating to:", ratingUrl);
      console.log("Payload:", {
        productId: productId as string,
        rate,
        comment,
        images,
        videos,
      });
  
      await axios.post(
        ratingUrl,
        {
          productId: productId as string,
          stars: rate,
          comment,
          images,
          videos,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      toast.success(
        "Gửi đánh giá thành công! Đơn hàng của bạn đã chuyển sang trạng thái 'Đã hoàn tất'. Bạn có thể xem trong tab 'Đã hoàn tất' tại danh sách đơn hàng."
      );
      // Điều hướng về /orders với query parameter để chọn tab "Đã hoàn tất"
      router.push("/orders?tab=completed");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message?: string }>;
        console.error(
          "Submit Error:",
          axiosError.response?.data || axiosError.message
        );
        const errorMessage =
          axiosError.response?.data?.message || axiosError.message;
        toast.error(`Lỗi gửi đánh giá: ${errorMessage}`);
      } else if (err instanceof Error) {
        console.error("Submit Error:", err.message);
        toast.error(`Lỗi gửi đánh giá: ${err.message}`);
      } else {
        console.error("Submit Error:", err);
        toast.error("Lỗi gửi đánh giá: Lỗi không xác định");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/orders");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <p className="text-xl text-red-400">{error}</p>
          <button
            onClick={() => router.push("/orders")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <ClipLoader color="#ffffff" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Nút quay lại */}
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center text-gray-300 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>

        {/* Tiêu đề */}
        <h1 className="text-4xl font-bold mb-8 text-center">
          Đánh giá sản phẩm
        </h1>

        {/* Thông tin sản phẩm */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg border border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center">
            {product.thumbnail ? (
              <Image
                src={`${SETTINGS.URL_IMAGE}/${product.thumbnail}`}
                alt={product.product_name}
                width={120}
                height={120}
                className="object-contain rounded-lg mr-6"
                unoptimized // Đã có trong mã gốc, giữ lại
                
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-gray-700 rounded-lg mr-6 text-gray-400 text-sm">
                No Image
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-white">
                {product.product_name}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Số lượng: {product.quantity}
              </p>
              <p className="text-sm text-gray-400">
                Giá: {formatToVND(product.price_end * product.quantity)}
              </p>
            </div>
          </div>
        </div>

        {/* Form đánh giá */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700"
        >
          {/* Đánh giá sao */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-white mb-3">
              Đánh giá sản phẩm
            </label>
            <div className="flex items-center space-x-3">
              <Rating
                name="product-rating"
                value={rate}
                onChange={handleRating}
                onChangeActive={handleRatingHover}
                precision={0.5}
                size="large"
                disabled={submitting}
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#f1c40f",
                  },
                  "& .MuiRating-iconEmpty": {
                    color: "#4b5563",
                  },
                  "& .MuiRating-iconHover": {
                    color: "#f1c40f",
                  },
                }}
                emptyIcon={<StarIcon fontSize="inherit" />}
                icon={<StarIcon fontSize="inherit" />}
              />
              {rate !== 0 && (
                <span
                  className={`text-base font-medium transition-colors duration-200 ${getLabelColor(
                    hover !== -1 ? hover : rate
                  )}`}
                >
                  {labels[hover !== -1 ? hover : rate]}
                </span>
              )}
            </div>
          </div>

          {/* Bình luận */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-white mb-3">
              Bình luận đánh giá
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors duration-200 resize-none"
              rows={5}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (chất lượng, đóng gói, giao hàng...)"
            />
          </div>

          {/* Tải lên hình ảnh/video */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-white mb-3">
              Tải lên hình ảnh hoặc video (tối đa 5 file)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4"
              multiple
              onChange={handleFileChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition duration-200"
            />
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      (<img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />)
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-24 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      ✕
                    </button>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center transition duration-200 ${
                submitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? (
                <>
                  <ClipLoader color="#ffffff" size={20} className="mr-2" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 rounded-lg text-white font-medium bg-gray-600 hover:bg-gray-700 transition duration-200"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingPage;
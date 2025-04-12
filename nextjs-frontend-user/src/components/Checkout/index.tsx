"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { SETTINGS } from "@/config/settings";
import { useCartStore } from "@/stores/useCart";
import { TCustomer } from "@/types/modes";
import ProvinceSelect from "../CheckoutForm";

const Checkout = () => {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const { data: session, status } = useSession();
  const idCustomer = session?.user.id;
  const isLoggedIn = status === "authenticated";

  const [customer, setCustomer] = useState<TCustomer | null>(null);
  const [buttonText, setButtonText] = useState("Đặt hàng");
  const [isLoading, setIsLoading] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + item.price_end * item.quantity,
    0
  );

  // Schema validate
  const schema = yup.object({
    first_name: yup.lazy(() =>
      isLoggedIn
        ? yup.string().optional()
        : yup.string().required("Vui lòng nhập tên")
    ),
    last_name: yup.lazy(() =>
      isLoggedIn
        ? yup.string().optional()
        : yup.string().required("Vui lòng nhập họ")
    ),
    phone: yup.lazy(() =>
      isLoggedIn
        ? yup.string().optional()
        : yup.string().required("Vui lòng nhập số điện thoại")
    ),
    email: yup.lazy(() =>
      isLoggedIn
        ? yup.string().optional()
        : yup
            .string()
            .email("Email không hợp lệ")
            .required("Vui lòng nhập email")
    ),
    state: yup.string().required("Vui lòng chọn tỉnh/thành phố"),
    city: yup.string().required("Vui lòng chọn quận/huyện"),
    street: yup.string().required("Vui lòng chọn phường/xã"),
    zip_code: yup.string().optional(),
    note: yup.string().optional(),
    payment_type: yup
      .number()
      .positive()
      .min(1)
      .max(4)
      .required("Vui lòng chọn phương thức thanh toán"),
  });

  type FormData = yup.InferType<typeof schema>;

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const {
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;

  // Get customer info
  useEffect(() => {
    if (isLoggedIn) {
      const fetchCustomer = async () => {
        try {
          const res = await fetch(
            `${SETTINGS.URL_API}/v1/customers/${idCustomer}`
          );
          if (!res.ok) throw new Error("Failed to fetch data");
          const result = await res.json();
          setCustomer(result.data);
        } catch (error) {
          console.error("Error fetching customer:", error);
        }
      };
      fetchCustomer();
    }
  }, [isLoggedIn, idCustomer]);

  useEffect(() => {
    if (customer) {
      setValue("state", customer.state);
      setValue("city", customer.city);
      setValue("street", customer.street);
      setValue("zip_code", customer.zip_code);
    }
  }, [customer, setValue]);

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;

    setIsLoading(true);
    setButtonText("Đang xử lý...");

    const payload = {
      customer: {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email,
        street: data.street,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        order_note: data.note,
      },
      payment_type: data.payment_type,
      order_items: cart,
    };

    try {
      const res = await fetch(`${SETTINGS.URL_API}/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isLoggedIn
            ? { Authorization: `Bearer ${session?.user.accessToken}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Order failed");
      const result = await res.json();

      setTimeout(() => {
        reset();
        clearCart();
        router.push("/cart?msg=success");
      }, 3000);
    } catch (err) {
      console.error("Error submitting order:", err);
      setButtonText("Đặt hàng");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="lg:col-span-2 space-y-4"
          >
            {/* Sản phẩm */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="font-semibold text-lg mb-4">
                Sản phẩm trong đơn ({cart.length})
              </h2>
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={`${SETTINGS.URL_IMAGE}/${item.photos[0]}`}
                      width={200}
                      height={200}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        Số lượng : {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-semibold">
                      {(item.price_end * item.quantity).toLocaleString("vi-VN")}{" "}
                      ₫
                    </p>
                    <p className="line-through text-sm text-gray-400">
                      {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Người đặt hàng */}
            <div className="bg-white p-4 rounded-xl shadow space-y-4">
              <h2 className="font-semibold text-lg">Người đặt hàng</h2>
              <input
                type="text"
                placeholder="Họ và tên"
                {...register("first_name")}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm">
                  {errors.first_name.message}
                </p>
              )}

              <input
                type="tel"
                placeholder="Số điện thoại"
                {...register("phone")}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}

              <input
                type="email"
                placeholder="Email (Không bắt buộc)"
                {...register("email")}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Địa chỉ - tỉnh huyện xã */}
            <ProvinceSelect />

            <div className="pt-4">
              <button
                type="submit"
                className={`w-full py-3 rounded-lg text-white font-semibold ${
                  isLoading ? "bg-gray-400" : "bg-[#101010] hover:bg-[#161616]"
                } transition`}
                disabled={isLoading}
              >
                {buttonText}
              </button>
            </div>
          </form>
        </FormProvider>

        {/* Thông tin đơn hàng */}
        <div className="sticky top-4 right-0 z-40 space-y-4">
          <div className="relative bg-white rounded-2xl px-4 py-5 text-sm border border-gray-100">
            <div className="space-y-3  text-sm text-gray-700">
              <div>
                <span className="font-semibold text-lg">
                  Thông tin đơn hàng
                </span>
              </div>

              <div className="flex justify-between border-b pb-4 border-dashed">
                <span>Tổng tiền</span>
                <span className="font-semibold text-lg">
                  {total.toLocaleString("vi-VN")} ₫
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span>Tổng khuyến mãi</span>
                <span className="text-green-600 font-semibold">
                  5.000.000 ₫
                </span>
              </div>

              <div className="flex justify-between pb-5">
                <span>Phí vận chuyển</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
            </div>

            <div className="border-t border-dashed pt-5 space-y-2">
              <div className="flex justify-between text-base ">
                <span>Cần thanh toán</span>
                <span className="font-semibold text-rose-500 text-lg">
                  {(total - 5000000).toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full mt-5 mb-5 bg-[#101010]  text-white font-semibold py-3 rounded-lg transition duration-300 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#101010] hover:bg-[#161616] transition"
              }`}
              disabled={isLoading}
            >
              {buttonText}
            </button>

            <p className="text-xs text-center text-gray-500 leading-relaxed font-medium">
              Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{" "}
              <a href="#" className="text-black font-medium underline">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="text-black font-medium underline">
                Chính sách xử lý dữ liệu cá nhân
              </a>{" "}
              của TOPZONE
            </p>

            <div className="absolute -bottom-4 left-0 w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="403"
                height="28"
                viewBox="0 0 403 28"
                fill="none"
                className="w-full"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 0H403V18.8171C403 21.7846 403 23.2683 402.487 24.4282C401.883 25.7925 400.792 26.8829 399.428 27.4867C398.268 28 396.785 28 393.817 28C391.534 28 390.392 28 389.652 27.808C388.208 27.4337 388.419 27.5431 387.28 26.579C386.696 26.0846 385.116 23.845 381.954 19.3656C379.649 16.0988 376.065 14 372.04 14C367.06 14 362.756 17.2133 360.712 21.8764C359.949 23.6168 359.568 24.487 359.531 24.5647C358.192 27.3971 357.411 27.9078 354.279 27.9975C354.193 28 353.845 28 353.15 28C352.454 28 352.107 28 352.021 27.9975C348.889 27.9078 348.107 27.3971 346.768 24.5647C346.731 24.487 346.35 23.6168 345.587 21.8765C343.544 17.2133 339.239 14 334.259 14C329.279 14 324.974 17.2133 322.931 21.8764C322.168 23.6168 321.787 24.487 321.75 24.5647C320.411 27.3971 319.629 27.9078 316.498 27.9975C316.412 28 316.064 28 315.368 28C314.673 28 314.325 28 314.239 27.9975C311.108 27.9078 310.326 27.3971 308.987 24.5647C308.95 24.487 308.569 23.6168 307.806 21.8765C305.763 17.2133 301.458 14 296.478 14C291.498 14 287.193 17.2133 285.15 21.8764C284.387 23.6168 284.005 24.487 283.969 24.5647C282.63 27.3971 281.848 27.9078 278.716 27.9975C278.63 28 278.283 28 277.587 28C276.892 28 276.544 28 276.458 27.9975C273.326 27.9078 272.545 27.3971 271.206 24.5647C271.169 24.487 270.788 23.6168 270.025 21.8765C267.981 17.2133 263.677 14 258.697 14C253.717 14 249.412 17.2133 247.368 21.8764C246.606 23.6168 246.224 24.487 246.188 24.5647C244.848 27.3971 244.067 27.9078 240.935 27.9975C240.849 28 240.501 28 239.806 28C239.111 28 238.763 28 238.677 27.9975C235.545 27.9078 234.764 27.3971 233.424 24.5647C233.388 24.487 233.006 23.6168 232.244 21.8765C230.2 17.2133 225.895 14 220.915 14C215.935 14 211.631 17.2133 209.587 21.8764C208.824 23.6168 208.443 24.487 208.406 24.5647C207.067 27.3971 206.286 27.9078 203.154 27.9975C203.068 28 202.72 28 202.025 28C201.329 28 200.982 28 200.896 27.9975C197.764 27.9078 196.982 27.3971 195.643 24.5647C195.606 24.487 195.225 23.6168 194.462 21.8765C192.419 17.2133 188.114 14 183.134 14C178.154 14 173.849 17.2133 171.806 21.8764C171.043 23.6168 170.662 24.487 170.625 24.5647C169.286 27.3971 168.504 27.9078 165.373 27.9975C165.287 28 164.939 28 164.243 28C163.548 28 163.2 28 163.114 27.9975C159.983 27.9078 159.201 27.3971 157.862 24.5647C157.825 24.487 157.444 23.6168 156.681 21.8765C154.638 17.2133 150.333 14 145.353 14C140.373 14 136.068 17.2133 134.025 21.8764C133.262 23.6168 132.881 24.487 132.844 24.5647C131.505 27.3971 130.723 27.9078 127.591 27.9975C127.505 28 127.158 28 126.462 28C125.767 28 125.419 28 125.333 27.9975C122.201 27.9078 121.42 27.3971 120.081 24.5647C120.044 24.487 119.663 23.6168 118.9 21.8764C116.856 17.2133 112.552 14 107.572 14C102.592 14 98.2868 17.2133 96.2433 21.8764C95.4806 23.6168 95.0993 24.487 95.0625 24.5647C93.7233 27.3971 92.9418 27.9078 89.8101 27.9975C89.7242 28 89.3765 28 88.681 28C87.9855 28 87.6378 28 87.5519 27.9975C84.4201 27.9078 83.6386 27.3971 82.2994 24.5647C82.2627 24.487 81.8814 23.6168 81.1187 21.8764C79.0752 17.2133 74.7703 14 69.7904 14C64.8104 14 60.5056 17.2133 58.462 21.8764C57.6993 23.6168 57.318 24.487 57.2813 24.5647C55.9421 27.3971 55.1606 27.9078 52.0289 27.9975C51.943 28 51.5952 28 50.8997 28C50.2043 28 49.8565 28 49.7706 27.9975C46.6389 27.9078 45.8574 27.3971 44.5182 24.5647C44.4815 24.487 44.1001 23.6168 43.3375 21.8764C41.2939 17.2133 36.9891 14 32.0091 14C28.1447 14 24.6868 15.9349 22.3767 18.9808C18.6745 23.8618 16.8235 26.3024 16.1428 26.81C15.1528 27.5482 15.4074 27.4217 14.2211 27.7644C13.4053 28 12.1727 28 9.70768 28C6.25895 28 4.53458 28 3.23415 27.3245C2.13829 26.7552 1.24477 25.8617 0.675519 24.7658C0 23.4654 0 21.7569 0 18.34V0Z"
                  fill="white"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

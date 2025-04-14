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
// import ProvinceForm from "../CheckoutForm/ProvinceForm";
import CustomerForm from "../CheckoutForm/CustomerForm";
import CheckoutSummary from "../CheckoutSummary";
import axios from "axios";
import PaymentMethod from "../PaymentMethod";
import dynamic from "next/dynamic";
import { toast, Zoom } from "react-toastify";

const ProvinceForm = dynamic(() => import("../CheckoutForm/ProvinceForm"), {
  ssr: false, // Tắt SSR cho ProvinceForm
});

const Checkout = () => {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const { data: session, status } = useSession();
  const idCustomer = session?.user.id;
  const isLoggedIn = status === "authenticated";

  const [customer, setCustomer] = useState<TCustomer | null>(null);
  const [buttonText, setButtonText] = useState("Đặt hàng");
  const [isLoading, setIsLoading] = useState(false);

  const total =
    cart?.length > 0
      ? cart.reduce((acc, item) => acc + item.price_end * item.quantity, 0)
      : 0;

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
    if (isLoggedIn && idCustomer && typeof idCustomer === "string") {
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
        order_note: data.note,
      },
      payment_type: data.payment_type,
      order_items: cart || [],
    };

    console.log("Payload gửi đi:", payload);

    try {
      const res = await axios.post(`${SETTINGS.URL_API}/v1/orders`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      toast.success("Đặt hàng thành công", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "light",
        transition: Zoom,
      });
      setTimeout(() => {
        reset();
        clearCart();
        router.push("/cart");
      }, 1000);
    } catch (error) {
      console.error("Error submitting order:", error);
      setButtonText("Đặt hàng");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[3e3e3f] min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FormProvider {...methods}>
          <form
            id="checkout-form"
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
            <CustomerForm register={register} errors={errors} />

            {/* Địa chỉ - tỉnh huyện xã */}
            <ProvinceForm />

            {/* Phương thức thanh toán  */}
            <PaymentMethod />
          </form>
        </FormProvider>

        {/* Thông tin đơn hàng */}
        <CheckoutSummary
          total={total}
          isLoading={isLoading}
          buttonText={buttonText}
        />
      </div>
    </div>
  );
};

export default Checkout;

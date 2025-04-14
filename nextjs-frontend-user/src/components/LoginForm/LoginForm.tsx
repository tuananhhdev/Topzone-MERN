"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import "../../styles/LoginForm.css";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
interface LoginFormProps {
  email: string;
  password: string;
}

const schema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })
  .required();

const LoginForm = ({ csrfToken }: { csrfToken: string | undefined }) => {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    googleLoading: false,
    facebookLoading: false,
  });

  //Nếu đã login rồi, thì chuyển hướng sang callbackUrl
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormProps>({
    resolver: yupResolver(schema),
  });

  const email = watch("email");
  const password = watch("password");

  const handleLoginSubmit: SubmitHandler<LoginFormProps> = async (data: {
    email: string;
    password: string;
  }) => {
    try {
      const resSignIn = await signIn("credentials", {
        redirect: false, // tắt tự động chuyển, để handle lỗi login
        email: data.email,
        password: data.password,
        csrfToken,
        callbackUrl: callbackUrl,
      });

      console.log("signIn Response:", resSignIn);

      //check nếu login thành công thì chuyển hướng
      if (resSignIn?.ok) {
        router.push(resSignIn.url || "/");
      } else {
        setError("invalid email or password");
      }
    } catch (error: any) {
      console.log("error", error);
      setError(error?.message);
    }
  };

  const handleLoginProvider = async (provider: string) => {
    try {
      setLoading({
        ...loading,
        googleLoading: provider === "google",
        facebookLoading: provider === "facebook",
      });
      const res = await signIn(provider, { redirect: false, callbackUrl });
      console.log("handleLoginProvider", res);
      //TODO: add new usser Account after then login Provider
      if (!res?.error) {
        router.push(callbackUrl);
      } else {
        setError("invalid email or password");
      }
    } catch (error: any) {
      setLoading({
        ...loading,
        googleLoading: false,
        facebookLoading: false,
      });
      setError(error);
    }
  };

  return (
    <>
      {/* <div className="flex justify-center items-center h-screen bg-gradient-to-r from-purple-500 to-blue-500">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Đăng Nhập
          </h2>
          <form
            onSubmit={handleSubmit(handleLoginSubmit)}
            className="space-y-6"
          >
            {error && (
              <p className="text-center bg-red-300 py-4 my-3 rounded">
                {error}
              </p>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email của bạn"
                {...register("email", { required: "Vui lòng nhập email" })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu"
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu",
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed`}
              disabled={!email || !password}
            >
              Đăng Nhập
            </button>
            <div className="flex justify-center items">
              <button
                type="button"
                className="mr-4 w-full py-3 bg-transparent text-black rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading.googleLoading}
                onClick={() => handleLoginProvider("google")}
              >
                <img
                  className="w-6 h-6"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  loading="lazy"
                  alt="google logo"
                />{" "}
                Đăng nhập bằng Google
              </button>
            </div>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-700">
                Chưa có tài khoản ?{" "}
              </span>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => router.push("/register")}
              >
                Đăng ký ngay
              </button>
            </div>

           
          </form>
        </div>
      </div> */}

      <form className="form" onSubmit={handleSubmit(handleLoginSubmit)}>
        {error && <p className="my-3 rounded bg-red-300 py-4 text-center">{error}</p>}
        <div className="flex-column">
          <label htmlFor="email">Email </label>
        </div>
        <div className="inputForm">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} viewBox="0 0 32 32" height={20}>
            <g data-name="Layer 3" id="Layer_3">
              <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
            </g>
          </svg>
          <input
            id="email"
            type="email"
            placeholder="Enter your Email"
            className="input"
            {...register("email", { required: "Vui lòng nhập email" })}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div className="flex-column">
          <label htmlFor="password">Password </label>
        </div>
        <div className="inputForm">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} viewBox="-64 0 512 512" height={20}>
            <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
            <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
          </svg>
          <input
            id="password"
            type="password"
            placeholder="Enter your Password"
            className="input"
            {...register("password", {
              required: "Vui lòng nhập mật khẩu",
            })}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        <div className="mt-2 flex-row">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          <span className="span">Forgot password?</span>
        </div>
        <button
          type="submit"
          disabled={!email || !password}
          className="button-submit disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Sign In
        </button>
        <Link href={"/register"}>
          <p className="p">
            Don't have an account? <span className="span">Sign Up</span>
          </p>
        </Link>
        <div className="line">
          <span>Or</span>
        </div>
        <div className="flex-row">
          <button
            className="btn google disabled:cursor-not-allowed"
            disabled={loading.googleLoading}
            onClick={() => handleLoginProvider("google")}
          >
            <svg
              xmlSpace="preserve"
              style={{
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 2,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
              viewBox="0 0 512 512"
              y="0px"
              x="0px"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              width={20}
              version="1.1"
            >
              <path
                d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256
	c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456
	C103.821,274.792,107.225,292.797,113.47,309.408z"
                style={{ fill: "#FBBB00" }}
              />
              <path
                d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451
	c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535
	c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"
                style={{ fill: "#518EF8" }}
              />
              <path
                d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512
	c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771
	c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"
                style={{ fill: "#28B446" }}
              />
              <path
                d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012
	c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0
	C318.115,0,375.068,22.126,419.404,58.936z"
                style={{ fill: "#F14336" }}
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="btn facebook disabled:cursor-not-allowed"
            disabled={loading.facebookLoading}
            onClick={() => handleLoginProvider("facebook")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlSpace="preserve"
              viewBox="0 0 16 16"
              width={20}
              height={20}
              id="facebook"
            >
              <path
                fill="#1976D2"
                fillRule="evenodd"
                d="M12 5.5H9v-2a1 1 0 0 1 1-1h1V0H9a3 3 0 0 0-3 3v2.5H4V8h2v8h3V8h2l1-2.5z"
                clipRule="evenodd"
              ></path>
            </svg>
            Facebook
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
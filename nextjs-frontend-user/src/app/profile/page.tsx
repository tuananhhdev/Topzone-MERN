"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import { TbUserEdit } from "react-icons/tb";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <div className="container mx-auto p-4 md:p-8">
      {isLoggedIn ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Tài khoản</h1>
            <h2 className="text-2xl font-medium">
              Xin chào , {session.user.name || session.user.full_name} ✌️
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Cột trái: Thông tin cá nhân */}
            <div className="flex h-[270px] justify-center rounded-xl bg-white p-6 shadow-md">
              <div className="relative mx-auto mb-4">
                {session?.user?.image || session?.user?.picture || session?.user?.avatar ? (
                  <Image
                    src={session.user.avatar || session.user.image || session.user.picture}
                    alt={`${session.user.full_name} - avatar`}
                    width={150}
                    height={150}
                    objectFit="contain"
                    className="rounded-full"
                  />
                ) : (
                  <Image
                    src={`https://avatar.iran.liara.run/username?username=${session.user.first_name}+${session.user.last_name}`}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
              </div>
            </div>

            {/* Cột phải: Các chức năng */}
            <div>
              <div className="rounded-xl bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-medium">Chỉnh sửa thông tin</h3>
                {/* Form chỉnh sửa thông tin */}
              </div>

              <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-medium">Thay đổi mật khẩu</h3>
                {/* Form thay đổi mật khẩu */}
              </div>

              {/* Các chức năng khác */}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <p className="mb-6 text-3xl font-bold">Thông tin cá nhân 🤞</p>
              <p className="mb-2 text-lg text-[#212121]">
                <strong>Full Name : </strong>
                {session?.user?.full_name || session?.user?.name}
              </p>
              <p className="mb-2 text-lg text-[#212121]">
                <strong>Phone : </strong> {session?.user?.phone || "Chưa có"}
              </p>
              <p className="mb-2 text-lg text-[#212121]">
                <strong>E - mail : </strong> {session?.user?.email || "Chưa có"}
              </p>
              <p className="mb-2 text-lg text-[#212121]">
                <strong>Date of birth : </strong>
                {session?.user?.email || "Chưa có"}
              </p>
              <p className="mb-2 text-lg text-[#212121]">
                <strong>Gender : </strong> {session?.user?.email || "Chưa có"}
              </p>
              <p className="mb-2 text-lg text-[#212121]">
                <strong>City :</strong> {session?.user?.city || "Chưa có"}
              </p>
              <p className="mb-2 text-lg text-[#212121]">
                <strong>Street :</strong> {session?.user?.street || "Chưa có"}
              </p>
              <p className="mb-2 text-lg text-[#212121]">
                <strong>State :</strong> {session?.user?.state || "Chưa có"}
              </p>
              <div className="mt-10">
                <button className="rounded-xl bg-[#212121] px-4 py-4 text-white">
                  <TbUserEdit className="text-3xl" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>
          <h2>Bạn chưa đăng nhập !</h2>
          {/* Hiển thị link hoặc nút đăng nhập */}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

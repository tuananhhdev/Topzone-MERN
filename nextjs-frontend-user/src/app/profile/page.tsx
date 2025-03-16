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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Tài khoản</h1>
            <h2 className="text-2xl font-medium">
              Xin chào , {session.user.name || session.user.full_name} ✌️
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái: Thông tin cá nhân */}
            <div className="bg-white flex justify-center h-[270px] rounded-xl shadow-md p-6">
              <div className="relative mx-auto mb-4 ">
                {session?.user?.image ||
                session?.user?.picture ||
                session?.user?.avatar ? (
                  <Image
                    src={
                      session.user.avatar ||
                      session.user.image ||
                      session.user.picture
                    }
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
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">
                  Chỉnh sửa thông tin
                </h3>
                {/* Form chỉnh sửa thông tin */}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Thay đổi mật khẩu</h3>
                {/* Form thay đổi mật khẩu */}
              </div>

              {/* Các chức năng khác */}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 ">
              <p className="text-3xl font-bold mb-6">Thông tin cá nhân 🤞</p>
              <p className="text-lg text-[#212121] mb-2">
                <strong>Full Name : </strong>
                {session?.user?.full_name || session?.user?.name}
              </p>
              <p className="text-lg text-[#212121] mb-2">
                <strong>Phone : </strong> {session?.user?.phone || "Chưa có"}
              </p>
              <p className="text-lg text-[#212121] mb-2">
                <strong>E - mail : </strong> {session?.user?.email || "Chưa có"}
              </p>
              <p className="text-lg text-[#212121] mb-2">
                <strong>Date of birth : </strong>
                {session?.user?.email || "Chưa có"}
              </p>
              <p className="text-lg text-[#212121] mb-2">
                <strong>Gender : </strong> {session?.user?.email || "Chưa có"}
              </p>
              <p className="text-lg text-[#212121] mb-2">
                <strong>City :</strong> {session?.user?.city || "Chưa có"}
              </p>
              <p className="text-lg text-[#212121] mb-2">
                <strong>Street :</strong> {session?.user?.street || "Chưa có"}
              </p>
              <p className="text-lg text-[#212121] mb-2">
                <strong>State :</strong> {session?.user?.state || "Chưa có"}
              </p>
              <div className="mt-10">
                <button className="bg-[#212121] text-white py-4 px-4 rounded-xl">
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

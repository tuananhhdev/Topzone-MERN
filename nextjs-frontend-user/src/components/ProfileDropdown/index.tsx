import React, { Fragment } from "react";
import { Menu, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FaRegUser } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";

const ProfileDropdown = () => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <>
      {isLoggedIn ? (
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button>
            {/* Hiển thị avatar người dùng */}
            {session?.user?.image || session?.user?.picture || session?.user?.avatar ? (
              <Image
                src={session?.user?.image || session?.user?.picture || session?.user?.avatar}
                alt="Avatar"
                width={40}
                height={40}
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
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 z-10 mt-2 w-[275px] origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="flex items-center px-4 py-3">
                {" "}
                {/* Thêm flex items-center */}
                {session?.user?.image || session?.user?.picture || session?.user?.avatar ? (
                  <Image
                    src={session?.user?.image || session?.user?.picture || session?.user?.avatar}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="mr-4 rounded-full" // Thêm margin-right
                  />
                ) : (
                  <Image
                    src={`https://avatar.iran.liara.run/username?username=${session.user.first_name}+${session.user.last_name}`}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="mr-4 rounded-full"
                  />
                )}
                <div>
                  <p className="text-gray-900">{session?.user?.full_name || session?.user?.name}</p>
                  <p className="truncate text-sm font-medium text-gray-500">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <Link
                      href="/profile"
                      className={`${
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                      } flex w-full items-center gap-2 px-4 py-2 text-left`}
                    >
                      <FaRegUser />
                      Account
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className={`${
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                      } flex w-full items-center gap-2 px-4 py-2 text-left`}
                    >
                      <LuLogOut />
                      Sign out
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      ) : (
        <Link href={"/login"}>
          <button
            className="login__button cursor-pointer rounded-full bg-white px-6 py-2 font-sans text-lg font-medium text-[#212121] transition duration-500 hover:shadow-xl"
            type="button"
          >
            Đăng nhập
          </button>
        </Link>
      )}
    </>
  );
};

export default ProfileDropdown;

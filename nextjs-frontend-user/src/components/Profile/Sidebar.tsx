import { FiLogOut } from "react-icons/fi";
import { TbUser, TbShoppingBag, TbSettings } from "react-icons/tb";
import { motion } from "framer-motion";
import Image from "next/image";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  logout: () => void;
  user: {
    full_name?: string;
    avatar?: string;
  };
}

export const Sidebar = ({ activeTab, setActiveTab, logout, user }: SidebarProps) => {
  const items = [
    { name: "Thông tin cá nhân", icon: TbUser },
    { name: "Đơn hàng", icon: TbShoppingBag },
    { name: "Cài đặt", icon: TbSettings },
    { name: "Đăng xuất", icon: FiLogOut },
  ];

  const userName = user.full_name || "Người dùng";
  console.log("User data:", { full_name: user.full_name, avatar: user.avatar }); // Log để kiểm tra dữ liệu

  // Đảm bảo avatarUrl hợp lệ
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
  const avatarUrl = user.avatar && user.avatar.trim() !== "" ? user.avatar : defaultAvatarUrl;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full lg:w-64 bg-white rounded-xl shadow-lg p-4"
    >
      <div className="flex items-center mb-6 p-2">
        <Image
          src={avatarUrl}
          alt="Ảnh đại diện"
          width={60}
          height={60}
          className="w-16 h-1w-16 rounded-full mr-3"
          onError={(e) => {
            console.log("Avatar load error, falling back to default"); // Log khi lỗi tải ảnh
            (e.target as HTMLImageElement).src = defaultAvatarUrl; // Fallback nếu lỗi
          }}
        />
        <h2 className="text-lg font-semibold">{userName}</h2>
      </div>
      <nav className="space-y-2">
        {items.map((item) => (
          <motion.button
            key={item.name}
            whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (item.name === "Đăng xuất") {
                logout();
              } else {
                setActiveTab(item.name);
              }
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:text-gray-900 transition-all duration-200 ${
              activeTab === item.name ? "bg-blue-200 font-medium" : "hover:bg-gray-100"
            } ${item.name === "Đăng xuất" ? "text-red-600 hover:text-red-700" : ""}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </motion.button>
        ))}
      </nav>
    </motion.div>
  );
};
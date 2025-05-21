import { motion } from "framer-motion";
import { FiEdit, FiUpload } from "react-icons/fi";
import { TbCheck, TbX } from "react-icons/tb";
import { useRef } from "react";
import { Customer } from "@/app/profile/page";

interface ProfileSectionProps {
  user: Customer;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  tempProfileData: Customer | null;
  originalData: Customer | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  handleCancel: () => void;
  fullNameInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ProfileSection = ({
  isEditing,
  setIsEditing,
  tempProfileData,
  handleInputChange,
  handleSave,
  handleCancel,
  fullNameInputRef,
}: ProfileSectionProps) => {
  if (!tempProfileData) return null;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Thông tin cá nhân</h3>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
                title="Lưu thay đổi"
              >
                <TbCheck size={20} /> Lưu
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-5 py-2 rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-300"
                title="Hủy chỉnh sửa"
              >
                <TbX size={20} /> Hủy
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-full transition-all duration-300"
              title="Chỉnh sửa hồ sơ"
            >
              <FiEdit size={20} /> Chỉnh sửa
            </motion.button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { label: "Họ và tên", name: "full_name", type: "text" },
          { label: "Số điện thoại", name: "phone", type: "tel" },
          { label: "Email", name: "email", type: "email", disabled: true },
          { label: "Địa chỉ", name: "street", type: "text" },
          { label: "Thành phố", name: "city", type: "text" },
          { label: "Quận/Huyện", name: "state", type: "text" },
        ].map((field, index) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex flex-col"
          >
            <label className="text-sm font-medium text-gray-600">
              {field.label}
            </label>
            <input
              ref={field.name === "full_name" ? fullNameInputRef : null}
              type={field.type}
              name={field.name}
              value={tempProfileData?.[field.name as keyof Customer] || ""}
              onChange={handleInputChange}
              disabled={!isEditing || field.disabled}
              className="mt-2 p-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 border-gray-300 text-gray-800 focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed hover:border-blue-400"
              aria-disabled={!isEditing || field.disabled}
            />
          </motion.div>
        ))}
      </div>
    </>
  );
};
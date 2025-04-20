"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { TbUserEdit, TbLock, TbCheck, TbX, TbTrash, TbHistory, TbMoon, TbSun, TbShield } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho thông tin người dùng
interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  avatar: string;
  full_name: string;
  active: boolean;
}

// Định nghĩa kiểu dữ liệu cho mật khẩu
interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Định nghĩa kiểu dữ liệu cho lịch sử hoạt động
interface ActivityLog {
  action: string;
  timestamp: string;
}

// Mở rộng kiểu dữ liệu của session từ NextAuth
interface ExtendedSessionUser {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  city?: string;
  phone?: string;
  accessToken?: string;
  emailVerified?: string | null;
  state?: string;
  street?: string;
}

interface ExtendedSession {
  user?: ExtendedSessionUser;
  expires: string;
}

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const isLoggedIn = status === 'authenticated';
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    id: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    avatar: '',
    full_name: '',
    active: true,
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Lấy hồ sơ người dùng từ backend
  const fetchProfile = useCallback(async () => {
    if (!isLoggedIn || !session?.user?.id || !session?.user?.accessToken) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/customers/profile`, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      });
      setUserData(response.data.data);
      // Ghi lại hoạt động
      addActivityLog('Đã xem hồ sơ');
    } catch (error: any) {
      setMessage({ text: 'Không thể tải hồ sơ.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, session?.user?.id, session?.user?.accessToken]);

  // Lấy trạng thái 2FA (giả lập)
  const fetch2FAStatus = useCallback(async () => {
    if (!isLoggedIn || !session?.user?.accessToken) return;
    try {
      const response = await axios.get('http://localhost:3000/api/customers/2fa-status', {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      });
      setIs2FAEnabled(response.data.enabled);
    } catch (error) {
      console.error('Lỗi khi lấy trạng thái 2FA:', error);
    }
  }, [isLoggedIn, session?.user?.accessToken]);

  // Lấy lịch sử hoạt động (giả lập)
  const fetchActivityLogs = useCallback(async () => {
    if (!isLoggedIn || !session?.user?.accessToken) return;
    try {
      const response = await axios.get('http://localhost:8080/api/v1/customers/activity-logs', {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      });
      setActivityLogs(response.data.logs);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử hoạt động:', error);
    }
  }, [isLoggedIn, session?.user?.accessToken]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
      fetch2FAStatus();
      fetchActivityLogs();
      addActivityLog('Đã đăng nhập');
    }
    // Khôi phục chế độ tối từ localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, [isLoggedIn, fetchProfile, fetch2FAStatus, fetchActivityLogs]);

  useEffect(() => {
    // Áp dụng chế độ tối
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Gửi thông báo đẩy (giả lập)
  const sendPushNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Thông Báo Từ TopZone', {
        body: message,
        icon: '/favicon.ico',
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Thông Báo Từ TopZone', {
            body: message,
            icon: '/favicon.ico',
          });
        }
      });
    }
  };

  // Ghi lại hoạt động
  const addActivityLog = (action: string) => {
    const newLog = {
      action,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev].slice(0, 5)); // Giữ tối đa 5 log
  };

  const handleSave = async () => {
    if (!session?.user?.accessToken || !session?.user?.id) {
      setMessage({ text: 'Thiếu mã thông báo xác thực hoặc ID người dùng.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/v1/customers/${userData.id}`, {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        street: userData.street,
        city: userData.city,
        state: userData.state,
      }, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      });

      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await axios.post('http://localhost:3000/api/customers/upload-avatar', formData, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setMessage({ text: 'Cập nhật hồ sơ thành công!', type: 'success' });
      sendPushNotification('Hồ sơ của bạn đã được cập nhật thành công!');
      addActivityLog('Đã cập nhật hồ sơ');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview('');
      await fetchProfile();
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Lỗi khi cập nhật hồ sơ.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!session?.user?.accessToken) {
      setMessage({ text: 'Thiếu mã thông báo xác thực.', type: 'error' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'Mật khẩu không khớp.', type: 'error' });
      return;
    }
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/customers/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      });
      setMessage({ text: 'Đổi mật khẩu thành công!', type: 'success' });
      sendPushNotification('Mật khẩu của bạn đã được đổi thành công!');
      addActivityLog('Đã đổi mật khẩu');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Lỗi khi đổi mật khẩu.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!session?.user?.accessToken || !session?.user?.id) {
      setMessage({ text: 'Thiếu mã thông báo xác thực hoặc ID người dùng.', type: 'error' });
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản của mình không?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:3000/api/customers/${userData.id}`, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      });
      setMessage({ text: 'Tài khoản đã được vô hiệu hóa. Bạn sẽ được đăng xuất.', type: 'success' });
      addActivityLog('Đã vô hiệu hóa tài khoản');
      setTimeout(() => signOut({ callbackUrl: '/login' }), 2000);
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Lỗi khi vô hiệu hóa tài khoản.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!session?.user?.accessToken) {
      setMessage({ text: 'Thiếu mã thông báo xác thực.', type: 'error' });
      return;
    }
    try {
      await axios.post('http://localhost:3000/api/customers/toggle-2fa', { enabled: !is2FAEnabled }, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      });
      setIs2FAEnabled(!is2FAEnabled);
      setMessage({ text: `Xác thực hai yếu tố đã được ${!is2FAEnabled ? 'bật' : 'tắt'}.`, type: 'success' });
      addActivityLog(`Đã ${!is2FAEnabled ? 'bật' : 'tắt'} xác thực hai yếu tố`);
    } catch (error: any) {
      setMessage({ text: 'Lỗi khi thay đổi trạng thái 2FA.', type: 'error' });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Bạn chưa đăng nhập!</h2>
          <a href="/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-5xl mx-auto">
        {/* Thanh điều hướng trên cùng */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold">Tài khoản</h1>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <h2 className="text-xl sm:text-2xl font-medium">Xin chào, {userData.full_name} ✌️</h2>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Chuyển đổi chế độ tối"
            >
              {darkMode ? <TbSun size={20} /> : <TbMoon size={20} />}
            </button>
          </div>
        </motion.div>

        {/* Nội dung chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Ảnh đại diện */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center"
          >
            <div className="relative mb-4">
              <img
                src={avatarPreview || userData.avatar || `https://avatar.iran.liara.run/username?username=${userData.full_name}`}
                alt="Ảnh đại diện"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
              />
              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition cursor-pointer"
                >
                  <TbUserEdit size={20} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>
            <h3 className="text-lg font-semibold">{userData.full_name}</h3>
            <p className="text-gray-500 dark:text-gray-400">{userData.email}</p>
            <p className={`mt-2 text-sm ${userData.active ? 'text-green-600' : 'text-red-600'}`}>
              {userData.active ? 'Hoạt động' : 'Không hoạt động'}
            </p>
          </motion.div>

          {/* Cột phải: Thông tin hồ sơ và các biểu mẫu */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin cá nhân */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Thông tin cá nhân</h3>
                <button
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isLoading}
                >
                  {isEditing ? <TbX size={20} /> : <TbUserEdit size={20} />}
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Họ', name: 'last_name', type: 'text' },
                  { label: 'Tên', name: 'first_name', type: 'text' },
                  { label: 'Số điện thoại', name: 'phone', type: 'tel' },
                  { label: 'Email', name: 'email', type: 'email', disabled: true },
                  { label: 'Địa chỉ', name: 'street', type: 'text' },
                  { label: 'Thành phố', name: 'city', type: 'text' },
                  { label: 'Tỉnh/Thành', name: 'state', type: 'text' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={userData[field.name as keyof UserData] || 'Chưa có'}
                      onChange={handleInputChange}
                      disabled={!isEditing || field.disabled}
                      className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      aria-disabled={!isEditing || field.disabled}
                    />
                  </div>
                ))}
              </div>

              {isEditing && (
                <button
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <TbCheck size={20} />
                  Lưu
                </button>
              )}
            </motion.div>

            {/* Đổi mật khẩu */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Thay đổi mật khẩu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>
              </div>
              <button
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                onClick={handlePasswordSubmit}
                disabled={isLoading}
              >
                <TbLock size={20} />
                Đổi mật khẩu
              </button>
            </motion.div>

            {/* Xác thực hai yếu tố */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Bảo mật</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TbShield size={20} />
                  <span>Xác thực hai yếu tố (2FA)</span>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-full text-white ${is2FAEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {is2FAEnabled ? 'Tắt' : 'Bật'}
                </button>
              </div>
            </motion.div>

            {/* Lịch sử hoạt động */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Lịch sử hoạt động</h3>
              {activityLogs.length > 0 ? (
                <ul className="space-y-2">
                  {activityLogs.map((log, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <TbHistory size={16} />
                      <span>{log.action} - {new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Chưa có hoạt động nào.</p>
              )}
            </motion.div>

            {/* Quản lý tài khoản */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Quản lý tài khoản</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Tạm thời vô hiệu hóa tài khoản của bạn. Hành động này có thể được hoàn tác bởi quản trị viên.</p>
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                onClick={handleDeactivate}
                disabled={isLoading}
              >
                <TbTrash size={20} />
                Vô hiệu hóa tài khoản
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
import { create } from "zustand";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  city: string;
  street: string;
  state: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: Customer | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updatedData: Partial<Customer>) => Promise<any>;
  initializeFromToken: () => void;
  checkInitialAuth: () => boolean;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

interface JwtPayload {
  id: string;
  email: string;
  full_name: string;
  iat: number;
  exp: number;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,

  login: async (accessToken: string, refreshToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_at", accessToken);
      localStorage.setItem("auth_rt", refreshToken);
    }
    const decoded: JwtPayload = jwtDecode(accessToken);
    await get().fetchProfile();
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_at");
      localStorage.removeItem("auth_rt");
    }
    set({ isAuthenticated: false, user: null });
  },

  fetchProfile: async () => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("auth_at");
    }
    if (token) {
      try {
        const response = await axios.get<Customer>(`${BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({
          isAuthenticated: true,
          user: response.data,
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin profile:", error);
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_at");
          localStorage.removeItem("auth_rt");
        }
        set({ isAuthenticated: false, user: null });
      }
    } else {
      set({ isAuthenticated: false, user: null });
    }
  },

  updateProfile: async (updatedData: Partial<Customer>) => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("auth_at");
    }
    if (token && updatedData.id) {
      try {
        const { id, ...payload } = updatedData;
        const filteredPayload: Partial<Customer> = {};
        for (const key in payload) {
          const k = key as keyof Customer;
          if (payload[k] !== undefined) {
            filteredPayload[k] = payload[k];
          }
        }
        if (Object.keys(filteredPayload).length === 0) {
          throw new Error("Không có trường nào để cập nhật");
        }
        const response = await axios.patch(
          `${BASE_URL}/${id}`,
          filteredPayload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await get().fetchProfile();
        return response.data;
      } catch (error) {
        console.error("Lỗi khi cập nhật profile:", error);
        throw error;
      }
    } else {
      throw new Error("Thiếu token hoặc ID để cập nhật");
    }
  },

  initializeFromToken: () => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("auth_at");
      if (accessToken) {
        try {
          const decoded: JwtPayload = jwtDecode(accessToken);
          const currentTime = Date.now() / 1000;
          if (decoded.exp > currentTime) {
            const tempUser: Customer = {
              id: decoded.id,
              full_name: decoded.full_name,
              email: decoded.email,
              phone: "",
              city: "",
              street: "",
              state: "",
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.full_name)}&background=random`,
            };
            set({
              isAuthenticated: true,
              user: tempUser,
            });
            get().fetchProfile();
          } else {
            localStorage.removeItem("auth_at");
            localStorage.removeItem("auth_rt");
            set({ isAuthenticated: false, user: null });
          }
        } catch (error) {
          console.error("Lỗi giải mã token:", error);
          localStorage.removeItem("auth_at");
          localStorage.removeItem("auth_rt");
          set({ isAuthenticated: false, user: null });
        }
      }
    }
  },

  checkInitialAuth: () => {
    if (typeof window === "undefined") return false;
    const accessToken = localStorage.getItem("auth_at");
    if (accessToken) {
      try {
        const decoded: JwtPayload = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
        localStorage.removeItem("auth_at");
        localStorage.removeItem("auth_rt");
        return false;
      }
    }
    return false;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("auth_at");
    }
    if (token) {
      try {
        await axios.post(
          `${BASE_URL}/change-password`,
          { oldPassword, newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Đổi mật khẩu thành công");
      } catch (error) {
        console.error("Lỗi khi đổi mật khẩu:", error);
        throw new Error("Đổi mật khẩu thất bại");
      }
    } else {
      throw new Error("Không có token xác thực");
    }
  },
}));

const BASE_URL = "http://localhost:8080/api/v1/customers";
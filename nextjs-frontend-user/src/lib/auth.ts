import { useRouter } from "next/navigation";

let router = null;

export const setRouter = (routerInstance) => {
  router = routerInstance;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json();
    if (res.ok) {
      // Lưu access-token mới
      localStorage.setItem("access_token", data.access_token);
      // Cập nhật refresh-token mới nếu API trả về
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      return data.access_token;
    } else {
      // Xử lý lỗi, xóa token và yêu cầu đăng nhập lại
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("access_token");
      if (router) router.push("/login");
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi làm mới token:", error);
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    if (router) router.push("/login");
    return null;
  }
};

// Hàm logout để xóa token
export const logout = () => {
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("access_token");
  if (router) router.push("/login");
};
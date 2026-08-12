import axios from "axios";

// Dùng biến môi trường VITE_API_URL nếu có, nếu không thì dùng đường dẫn tương đối /api
// (khi Express phục vụ cả frontend lẫn API trên cùng cổng, /api sẽ trỏ đúng)
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động đính kèm Token vào Header nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động đăng xuất khi token hết hạn hoặc không hợp lệ (401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa thông tin đăng nhập và chuyển về trang login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

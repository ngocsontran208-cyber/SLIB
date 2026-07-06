import axios, { AxiosError } from 'axios';

declare const process: any;

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE_URL : '') || 'http://localhost:5132',
  withCredentials: true, // Quan trọng: Đính kèm HttpOnly Cookie vào mọi request
});

// Interceptor Request
api.interceptors.request.use(
  (config) => {
    // Không cần gán JWT vào header Authorization vì đã dùng HttpOnly Cookie
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 (Unauthorized) => Token hết hạn, thử refresh
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      try {
        // Gọi API refresh token. Vì withCredentials = true, nó sẽ gửi RefreshToken qua Cookie
        await axios.post(`${api.defaults.baseURL}/api/auth/refresh-token`, {}, { withCredentials: true });
        
        // Sau khi refresh thành công, gọi lại request cũ
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại, chuyển hướng về trang login, nhưng tránh lặp vô tận nếu đang ở trang login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Xử lý lỗi Rate Limit (429)
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please slow down.');
      // Có thể hiển thị Toast Notification tại đây
    }

    return Promise.reject(error);
  }
);

export default api;

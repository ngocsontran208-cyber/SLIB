import api from './axios';


export const login = async (payload: { username: string; password: string }) => {
  const response = await api.post<{ message: string; expiration: string }>('/api/Auth/login', payload);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get<{ id: number; email: string; roles: string[] }>('/api/Auth/me');
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post<{ message: string; expiration: string }>('/api/Auth/refresh-token');
  return response.data;
};

export const revoke = async (userId: number) => {
  const response = await api.post<string>(`/api/Auth/revoke/${userId}`);
  return response.data;
};

export const logout = () => {
  // Tạm thời giả lập việc logout bằng cách redirect hoặc xóa localStorage
  // Sẽ update lại nếu Backend cung cấp API /api/Auth/logout thực sự
  window.location.href = '/login';
};

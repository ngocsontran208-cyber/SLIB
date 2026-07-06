import api from './axios';

export const search = async (query: string) => {
  // Trả về any hoặc một type đặc thù của Elasticsearch nếu có
  const response = await api.get<any>('/api/Search', { params: { q: query } });
  return response.data;
};

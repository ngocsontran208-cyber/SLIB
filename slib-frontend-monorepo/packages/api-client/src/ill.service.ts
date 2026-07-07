import api from './axios';
import type { IllRequest } from '@slib/types';

export const illService = {
  getRequests: async (): Promise<IllRequest[]> => {
    const response = await api.get<IllRequest[]>('/api/Ill/requests');
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<IllRequest> => {
    const response = await api.patch<IllRequest>(`/api/Ill/requests/${id}/status`, { status });
    return response.data;
  }
};

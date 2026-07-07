import api from './axios';
import type { StocktakeSession, CreateSessionRequest, ScanRequest } from '@slib/types';

export const inventoryService = {
  getSessions: async (): Promise<StocktakeSession[]> => {
    const response = await api.get<StocktakeSession[]>('/api/Inventory/sessions');
    return response.data;
  },

  createSession: async (request: CreateSessionRequest): Promise<StocktakeSession> => {
    const response = await api.post<StocktakeSession>('/api/Inventory/sessions', request);
    return response.data;
  },

  scanBarcode: async (request: ScanRequest): Promise<any> => {
    const response = await api.post<any>('/api/Inventory/scan', request);
    return response.data;
  }
};

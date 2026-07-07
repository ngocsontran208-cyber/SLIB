import api from './axios';
import type { NotificationTemplate, PreviewTemplateRequest, PreviewTemplateResponse } from '@slib/types';

export const templateService = {
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await api.get('/api/Template');
    return response.data;
  },

  getTemplateById: async (id: number): Promise<NotificationTemplate> => {
    const response = await api.get(`/api/Template/${id}`);
    return response.data;
  },

  createTemplate: async (data: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
    const response = await api.post('/api/Template', data);
    return response.data;
  },

  updateTemplate: async (id: number, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
    const response = await api.put(`/api/Template/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await api.delete(`/api/Template/${id}`);
  },

  previewTemplate: async (request: PreviewTemplateRequest): Promise<PreviewTemplateResponse> => {
    const response = await api.post('/api/Template/preview', request);
    return response.data;
  }
};

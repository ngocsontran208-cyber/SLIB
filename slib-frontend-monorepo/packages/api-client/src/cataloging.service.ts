import api from './axios';
import type { BibliographicRecord, PhysicalItem, MarcField } from '@slib/types';

// ==========================================
// Cataloging Controller
// ==========================================
export const getRecords = async () => {
  const response = await api.get<BibliographicRecord[]>('/api/cataloging/records');
  return response.data;
};

export const getRecord = async (id: number) => {
  const response = await api.get<BibliographicRecord>(`/api/cataloging/records/${id}`);
  return response.data;
};

export const createRecord = async (payload: { templateId: number; title: string; author?: string; fields: MarcField[] }) => {
  const response = await api.post<BibliographicRecord>('/api/cataloging/records', payload);
  return response.data;
};

export const importBinaryStream = async (file: File, templateId: number) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<{ message: string; successCount: number; failureCount: number }>(
    `/api/cataloging/records/import?templateId=${templateId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export const searchOnline = async (targetId: number, templateId: number, isbn: string) => {
  const response = await api.get<{ targetId: number; templateId: number; isbn: string; marcData: MarcField[] }>(
    `/api/cataloging/records/search-online`,
    { params: { targetId, templateId, isbn } }
  );
  return response.data;
};

// ==========================================
// Item Controller
// ==========================================
export const registerItem = async (payload: { bibliographicRecordId: number; barcode: string }) => {
  const response = await api.post<PhysicalItem>('/api/items', payload);
  return response.data;
};

export const getItemsByRecord = async (recordId: number) => {
  const response = await api.get<{ id: number; barcode: string; status: string }[]>(`/api/items/record/${recordId}`);
  return response.data;
};

export const deleteItem = async (id: number) => {
  const response = await api.delete(`/api/items/${id}`);
  return response.data;
};

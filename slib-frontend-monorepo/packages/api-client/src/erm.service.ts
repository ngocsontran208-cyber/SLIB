import api from './axios';
import type { Vendor, ElectronicResourceLicense } from '@slib/types';

export const getVendors = async () => {
  const response = await api.get<Vendor[]>('/api/admin/erm/vendors');
  return response.data;
};

export const createVendor = async (payload: Vendor) => {
  const response = await api.post<Vendor>('/api/admin/erm/vendors', payload);
  return response.data;
};

export const getLicenses = async () => {
  const response = await api.get<(ElectronicResourceLicense & { vendorName: string })[]>('/api/admin/erm/licenses');
  return response.data;
};

export const createLicense = async (payload: ElectronicResourceLicense) => {
  const response = await api.post<ElectronicResourceLicense>('/api/admin/erm/licenses', payload);
  return response.data;
};

export const updateLicense = async (id: number, payload: ElectronicResourceLicense) => {
  const response = await api.put<ElectronicResourceLicense>(`/api/admin/erm/licenses/${id}`, payload);
  return response.data;
};

export const deleteLicense = async (id: number) => {
  const response = await api.delete(`/api/admin/erm/licenses/${id}`);
  return response.data;
};

import api from './axios';
import type { SerialSubscription, SerialIssue } from '@slib/types';

export const createSubscription = async (subscription: Partial<SerialSubscription>): Promise<SerialSubscription> => {
  const response = await api.post('/api/serials/subscriptions', subscription);
  return response.data;
};

export const predictIssues = async (subscriptionId: number): Promise<SerialIssue[]> => {
  const response = await api.post(`/api/serials/subscriptions/${subscriptionId}/predict`);
  return response.data;
};

export const getExpectedIssues = async (subscriptionId?: number): Promise<SerialIssue[]> => {
  const params = subscriptionId ? { subscriptionId } : {};
  const response = await api.get('/api/serials/issues', { params });
  return response.data;
};

export const checkInIssue = async (issueId: number, barcode?: string): Promise<any> => {
  const params = barcode ? { barcode } : {};
  const response = await api.post(`/api/serials/issues/${issueId}/checkin`, null, { params });
  return response.data;
};

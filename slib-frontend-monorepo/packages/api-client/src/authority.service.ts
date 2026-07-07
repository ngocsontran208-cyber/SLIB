import api from './axios';
import type { AuthorityRecord } from '@slib/types';

export const suggestAuthorities = async (q: string, type: string = 'Personal Name'): Promise<AuthorityRecord[]> => {
  const response = await api.get('/api/authorities/suggest', { params: { q, type } });
  return response.data;
};

export const sruSearch = async (targetId: number, query: string): Promise<any[]> => {
  const response = await api.get('/api/authorities/sru-search', { params: { targetId, query } });
  return response.data;
};

import api from './axios';
import type { BookLoan, Fine } from '@slib/types';

export const borrowBook = async (payload: { userId: number; barcode: string }) => {
  const response = await api.post<BookLoan>('/api/Librarian/borrow', payload);
  return response.data;
};

export const returnBook = async (loanId: number) => {
  const response = await api.post<BookLoan>(`/api/Librarian/return/${loanId}`);
  return response.data;
};

export const getLoans = async () => {
  // Mock API for now, wait for BE /api/Librarian/loans
  const response = await api.get<BookLoan[]>('/api/Librarian/loans').catch(() => ({ data: [] as BookLoan[] }));
  return response.data;
};

export const renewLoan = async (loanId: number) => {
  const response = await api.post<BookLoan>(`/api/Librarian/renew/${loanId}`);
  return response.data;
};

export const getFines = async () => {
  // Mock API for now, wait for BE /api/Librarian/fines
  const response = await api.get<Fine[]>('/api/Librarian/fines').catch(() => ({ data: [] as Fine[] }));
  return response.data;
};

export const payFine = async (payload: { fineId: number; amount: number }) => {
  const response = await api.post('/api/Librarian/pay-fine', payload);
  return response.data;
};

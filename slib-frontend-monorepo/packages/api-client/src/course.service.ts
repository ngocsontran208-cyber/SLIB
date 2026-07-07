import api from './axios';
import type { Course, CourseReserveItem, AddReserveItemRequest } from '@slib/types';

export const courseService = {
  getCourses: async (): Promise<Course[]> => {
    const response = await api.get<Course[]>('/api/CourseReserve/courses');
    return response.data;
  },

  addItemToReserveList: async (request: AddReserveItemRequest): Promise<CourseReserveItem> => {
    const response = await api.post<CourseReserveItem>('/api/CourseReserve/items', request);
    return response.data;
  },

  removeItemFromReserveList: async (itemId: number): Promise<void> => {
    await api.delete(`/api/CourseReserve/items/${itemId}`);
  }
};

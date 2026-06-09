import api from '@/lib/api';
import type { ApiResponse, Category, CategoryRequest, Page } from '@/types';

export const categoryApi = {
  getAll: () =>
    api.get<ApiResponse<Category[]>>('/public/categories').then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Category>>(`/admin/categories/${id}`).then((r) => r.data),

  create: (data: CategoryRequest) =>
    api.post<ApiResponse<Category>>('/admin/categories', data).then((r) => r.data),

  update: (id: string, data: CategoryRequest) =>
    api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/categories/${id}`).then((r) => r.data),

  deleteBulk: (ids: string[]) =>
    api.delete<ApiResponse<void>>('/admin/categories/bulk', { data: ids }).then((r) => r.data),

  toggleActive: (id: string) =>
    api.patch<ApiResponse<Category>>(`/admin/categories/${id}/toggle-active`).then((r) => r.data),
};

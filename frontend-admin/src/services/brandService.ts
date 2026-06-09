import api from '@/lib/api';
import type { ApiResponse, Brand, BrandRequest } from '@/types';

export const brandApi = {
  getAll: (p?: { page?: number; size?: number; keyword?: string }) =>
    api.get<ApiResponse<import('@/types').Page<Brand>>>('/admin/brands', { params: p }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Brand>>(`/admin/brands/${id}`).then((r) => r.data),

  create: (data: BrandRequest) =>
    api.post<ApiResponse<Brand>>('/admin/brands', data).then((r) => r.data),

  update: (id: string, data: BrandRequest) =>
    api.put<ApiResponse<Brand>>(`/admin/brands/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/brands/${id}`).then((r) => r.data),

  deleteBulk: (ids: string[]) =>
    api.delete<ApiResponse<void>>('/admin/brands/bulk', { data: ids }).then((r) => r.data),
};

import api from '@/lib/api';
import type { ApiResponse, Product, ProductRequest, Page } from '@/types';

export const productApi = {
  getAll: (params?: { page?: number; size?: number; status?: string; keyword?: string }) =>
    api.get<ApiResponse<Page<Product>>>('/admin/products', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Product>>(`/admin/products/${id}`).then((r) => r.data),

  create: (data: ProductRequest) =>
    api.post<ApiResponse<Product>>('/admin/products', data).then((r) => r.data),

  update: (id: string, data: Partial<ProductRequest>) =>
    api.put<ApiResponse<Product>>(`/admin/products/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/products/${id}`).then((r) => r.data),

  deleteBulk: (ids: string[]) =>
    api.delete<ApiResponse<void>>('/admin/products/bulk', { data: ids }).then((r) => r.data),

  updateStock: (id: string, quantity: number, operation: 'ADD' | 'SUBTRACT' | 'SET') =>
    api.patch<ApiResponse<Product>>(`/admin/products/${id}/stock`, { quantity, operation }).then((r) => r.data),

  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ApiResponse<{ imageUrl: string }>>(`/admin/products/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};

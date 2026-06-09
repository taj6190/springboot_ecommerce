import api from '@/lib/api';
import type { ApiResponse, Order, OrderStatus, Page } from '@/types';

export const orderApi = {
  getAll: (params?: { page?: number; size?: number; status?: OrderStatus }) =>
    api.get<ApiResponse<Page<Order>>>('/admin/orders', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/admin/orders/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
};

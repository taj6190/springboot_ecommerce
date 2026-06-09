import api from '@/lib/api';
import type { ApiResponse, DashboardStats } from '@/types';

export const dashboardApi = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/admin/reports/dashboard').then((r) => r.data),
  
  getSalesChart: (days = 30) =>
    api.get<ApiResponse<{ date: string; revenue: number; orders: number }[]>>(
      `/admin/reports/sales?days=${days}`
    ).then((r) => r.data),
};

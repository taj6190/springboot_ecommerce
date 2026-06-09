import api from '@/lib/api';
import type { ApiResponse, AuthResponse, LoginRequest } from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data).then((r) => r.data),

  logout: () => api.post('/auth/logout').catch(() => {}),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }).then((r) => r.data),
};

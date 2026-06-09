import api from '@/lib/api';
import type { ApiResponse, Slider, StaticPage, HomepageSection } from '@/types';

export const cmsApi = {
  // ─── Sliders ──────────────────────────────────
  getSliders: () =>
    api.get<ApiResponse<Slider[]>>('/admin/sliders').then((r) => r.data),
  createSlider: (data: Partial<Slider>) =>
    api.post<ApiResponse<Slider>>('/admin/sliders', data).then((r) => r.data),
  updateSlider: (id: string, data: Partial<Slider>) =>
    api.put<ApiResponse<Slider>>(`/admin/sliders/${id}`, data).then((r) => r.data),
  deleteSlider: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/sliders/${id}`).then((r) => r.data),
  deleteSlidersBulk: (ids: string[]) =>
    api.delete<ApiResponse<void>>('/admin/sliders/bulk', { data: ids }).then((r) => r.data),

  // ─── Static Pages ────────────────────────────
  getPages: () =>
    api.get<ApiResponse<StaticPage[]>>('/admin/pages').then((r) => r.data),
  createPage: (data: Partial<StaticPage>) =>
    api.post<ApiResponse<StaticPage>>('/admin/pages', data).then((r) => r.data),
  updatePage: (id: string, data: Partial<StaticPage>) =>
    api.put<ApiResponse<StaticPage>>(`/admin/pages/${id}`, data).then((r) => r.data),
  deletePage: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/pages/${id}`).then((r) => r.data),
  deletePagesBulk: (ids: string[]) =>
    api.delete<ApiResponse<void>>('/admin/pages/bulk', { data: ids }).then((r) => r.data),

  // ─── Homepage Sections ───────────────────────
  getSections: () =>
    api.get<ApiResponse<HomepageSection[]>>('/admin/homepage/sections').then((r) => r.data),
  createSection: (data: Partial<HomepageSection>) =>
    api.post<ApiResponse<HomepageSection>>('/admin/homepage/sections', data).then((r) => r.data),
  updateSection: (id: string, data: Partial<HomepageSection>) =>
    api.put<ApiResponse<HomepageSection>>(`/admin/homepage/sections/${id}`, data).then((r) => r.data),
  deleteSection: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/homepage/sections/${id}`).then((r) => r.data),
  deleteSectionsBulk: (ids: string[]) =>
    api.delete<ApiResponse<void>>('/admin/homepage/sections/bulk', { data: ids }).then((r) => r.data),

  // ─── Reviews ─────────────────────────────────
  getPendingReviews: (page = 0) =>
    api.get<ApiResponse<any>>('/admin/reviews/pending', { params: { page, size: 20 } }).then((r) => r.data),
  approveReview: (id: string) =>
    api.patch<ApiResponse<any>>(`/admin/reviews/${id}/approve`).then((r) => r.data),
  deleteReview: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/reviews/${id}`).then((r) => r.data),
};

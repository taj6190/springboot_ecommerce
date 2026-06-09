import api from '@/lib/api';
import type { ApiResponse } from '@/types';

export const uploadApi = {
  /**
   * Upload a file to Cloudinary via the backend proxy.
   * @param file - The file to upload
   * @param folder - Cloudinary folder (e.g. 'categories', 'brands', 'products')
   * @returns The uploaded file URL
   */
  upload: async (file: File, folder = 'general'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res = await api.post<ApiResponse<{ url: string }>>('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.url;
  },

  /** Delete a file from Cloudinary */
  delete: (url: string) =>
    api.delete<ApiResponse<void>>('/admin/upload', { params: { url } }).then((r) => r.data),
};

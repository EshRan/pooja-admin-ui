import { apiClient } from './client';
import type { Banner } from '../types/banner';

export const bannerService = {
    getAll: async (): Promise<Banner[]> => {
        const response = await apiClient.get('/api/banners');
        return response.data;
    },

    getById: async (id: number): Promise<Banner> => {
        const response = await apiClient.get(`/api/banners/${id}`);
        return response.data;
    },

    create: async (item: Banner, image?: File): Promise<Banner> => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image) formData.append('image', image);

        const response = await apiClient.post('/api/banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    update: async (id: number, item: Partial<Banner>, image?: File): Promise<Banner> => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image) formData.append('image', image);

        const response = await apiClient.put(`/api/banners/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/banners/${id}`);
    }
};

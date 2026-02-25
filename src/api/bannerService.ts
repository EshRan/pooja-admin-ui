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

    create: async (item: Banner): Promise<Banner> => {
        const response = await apiClient.post('/api/banners/multiple', [item]);
        return response.data[0];
    },

    update: async (id: number, item: Partial<Banner>): Promise<Banner> => {
        const response = await apiClient.put(`/api/banners/${id}`, item);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/banners/${id}`);
    }
};

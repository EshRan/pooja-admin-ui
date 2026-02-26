import { apiClient } from './client';
import type { Nut } from '../types/nut';

export const nutService = {
    getAll: async (): Promise<Nut[]> => {
        const response = await apiClient.get('/api/nuts');
        return response.data;
    },

    getById: async (id: number): Promise<Nut> => {
        const response = await apiClient.get(`/api/nuts/${id}`);
        return response.data;
    },

    create: async (item: Nut, image?: File): Promise<Nut> => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image) formData.append('image', image);

        const response = await apiClient.post('/api/nuts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    update: async (id: number, item: Partial<Nut>, image?: File): Promise<Nut> => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image) formData.append('image', image);

        const response = await apiClient.put(`/api/nuts/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/nuts/${id}`);
    }
};

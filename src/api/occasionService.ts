import { apiClient } from './client';
import type { Occasion } from '../types/occasion';

export const occasionService = {
    getAll: async (): Promise<Occasion[]> => {
        const response = await apiClient.get('/api/occasions');
        return response.data;
    },

    getById: async (id: number): Promise<Occasion> => {
        const response = await apiClient.get(`/api/occasions/${id}`);
        return response.data;
    },

    create: async (item: Occasion, image?: File): Promise<Occasion> => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image) formData.append('image', image);

        const response = await apiClient.post('/api/occasions', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    update: async (id: number, item: Partial<Occasion>, image?: File): Promise<Occasion> => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image) formData.append('image', image);

        const response = await apiClient.put(`/api/occasions/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/occasions/${id}`);
    }
};

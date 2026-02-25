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

    create: async (item: Occasion): Promise<Occasion> => {
        const response = await apiClient.post('/api/occasions', item);
        return response.data;
    },

    update: async (id: number, item: Partial<Occasion>): Promise<Occasion> => {
        const response = await apiClient.put(`/api/occasions/${id}`, item);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/occasions/${id}`);
    }
};

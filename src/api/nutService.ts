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

    create: async (item: Nut): Promise<Nut> => {
        const response = await apiClient.post('/api/nuts', item);
        return response.data;
    },

    update: async (id: number, item: Partial<Nut>): Promise<Nut> => {
        const response = await apiClient.put(`/api/nuts/${id}`, item);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/nuts/${id}`);
    }
};

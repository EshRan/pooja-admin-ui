import { apiClient } from './client';
import type { PoojaItem } from '../types/item';

export const itemService = {
    getAll: async (): Promise<PoojaItem[]> => {
        const response = await apiClient.get('/api/items');
        return response.data;
    },

    getById: async (id: number): Promise<PoojaItem> => {
        const response = await apiClient.get(`/api/items/${id}`);
        return response.data;
    },

    create: async (item: PoojaItem): Promise<PoojaItem> => {
        const response = await apiClient.post('/api/items', item);
        return response.data;
    },

    update: async (id: number, item: Partial<PoojaItem>): Promise<PoojaItem> => {
        const response = await apiClient.put(`/api/items/${id}`, item);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/items/${id}`);
    }
};

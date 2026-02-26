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

    create: async (item: PoojaItem, image?: File): Promise<PoojaItem> => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image) formData.append('image', image);

        const response = await apiClient.post('/api/items', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    update: async (id: number, item: Partial<PoojaItem>, image?: File): Promise<PoojaItem> => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image) formData.append('image', image);

        const response = await apiClient.put(`/api/items/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/items/${id}`);
    }
};

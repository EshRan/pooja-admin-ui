import { apiClient } from './client';
import type { PoojaItemOccasionMapping } from '../types/mapping';

export const mappingService = {
    getAll: async (): Promise<PoojaItemOccasionMapping[]> => {
        const response = await apiClient.get('/api/mappings');
        return response.data;
    },

    create: async (itemId: number, occasionId: number, notes?: string): Promise<PoojaItemOccasionMapping> => {
        const response = await apiClient.post('/api/mappings', null, {
            params: {
                itemId,
                occasionId,
                notes
            }
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/mappings/${id}`);
    }
};

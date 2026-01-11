import { apiClient } from '../lib/api-client';
import type {
  KissReflection,
  CreateKissReflectionInput,
  KissReflectionResponse,
  KissUnlockStatus,
  CreateKissReflectionResponse,
} from '../types';

export const kissService = {
  // Get KISS reflection by date
  async getReflectionByDate(date: string): Promise<KissReflection | null> {
    const response = await apiClient.get<KissReflectionResponse>('/kiss', {
      params: { date },
    });
    return response.data.reflection;
  },

  // Check if KISS reflection is unlocked for a specific date
  async checkUnlockStatus(date: string): Promise<KissUnlockStatus> {
    const response = await apiClient.get<KissUnlockStatus>('/kiss/check-unlock', {
      params: { date },
    });
    return response.data;
  },

  // Create or update KISS reflection
  async saveReflection(data: CreateKissReflectionInput): Promise<KissReflection> {
    const response = await apiClient.post<CreateKissReflectionResponse>('/kiss', data);
    return response.data.reflection;
  },

  // Delete a KISS reflection
  async deleteReflection(id: number): Promise<void> {
    await apiClient.delete(`/kiss/${id}`);
  },
};

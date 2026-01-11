import { apiClient } from '../lib/api-client';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TasksResponse,
  TaskResponse,
} from '../types';

export const taskService = {
  // Get tasks by date
  async getTasksByDate(date: string): Promise<Task[]> {
    const response = await apiClient.get<TasksResponse>('/tasks', {
      params: { date },
    });
    return response.data.tasks;
  },

  // Get tasks by date for a specific user (group member)
  async getUserTasksByDate(userId: number, date: string): Promise<Task[]> {
    const response = await apiClient.get<TasksResponse>(`/users/${userId}/tasks`, {
      params: { date },
    });
    return response.data.tasks;
  },

  // Get a single task
  async getTask(id: number): Promise<Task> {
    const response = await apiClient.get<TaskResponse>(`/tasks/${id}`);
    return response.data.task;
  },

  // Create a new task
  async createTask(data: CreateTaskInput): Promise<Task> {
    const response = await apiClient.post<TaskResponse>('/tasks', data);
    return response.data.task;
  },

  // Update a task
  async updateTask(id: number, data: UpdateTaskInput): Promise<Task> {
    const response = await apiClient.put<TaskResponse>(`/tasks/${id}`, data);
    return response.data.task;
  },

  // Update task progress
  async updateProgress(id: number, progressValue: number): Promise<Task> {
    const response = await apiClient.patch<TaskResponse>(
      `/tasks/${id}/progress`,
      { progressValue }
    );
    return response.data.task;
  },

  // Delete a task
  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};

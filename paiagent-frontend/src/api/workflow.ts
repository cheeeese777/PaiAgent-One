import client from './client';
import type { ApiResponse } from '../types/api';

interface WorkflowDTO {
  id?: number;
  name: string;
  flowJson: string;
  description?: string;
  version?: number;
}

interface WorkflowListItem {
  id: number;
  name: string;
  description: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const workflowApi = {
  list: () =>
    client.get<ApiResponse<WorkflowListItem[]>>('/workflows').then(r => r.data.data),

  get: (id: number) =>
    client.get<ApiResponse<WorkflowDTO>>(`/workflows/${id}`).then(r => r.data.data),

  create: (data: WorkflowDTO) =>
    client.post<ApiResponse<WorkflowDTO>>('/workflows', data).then(r => r.data.data),

  update: (id: number, data: WorkflowDTO) =>
    client.put<ApiResponse<WorkflowDTO>>(`/workflows/${id}`, data).then(r => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<void>>(`/workflows/${id}`).then(r => r.data),
};

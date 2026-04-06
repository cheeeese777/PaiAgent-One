import client from './client';
import type { ApiResponse } from '../types/api';
import type { ExecutionResult } from '../types/execution';

interface ExecutionRequest {
  workflowId: number;
  inputData: string;
}

export const executionApi = {
  run: (data: ExecutionRequest) =>
    client.post<ApiResponse<ExecutionResult>>('/executions/run', data).then(r => r.data.data),

  get: (id: number) =>
    client.get<ApiResponse<ExecutionResult>>(`/executions/${id}`).then(r => r.data.data),
};

import client from './client';
import type { ApiResponse } from '../types/api';
import type { NodeCategory } from '../types/node';

export const nodeApi = {
  getDefinitions: () =>
    client.get<ApiResponse<NodeCategory[]>>('/nodes/definitions').then(r => r.data.data),
};

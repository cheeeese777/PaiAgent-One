import client from './client';
import type { ApiResponse } from '../types/api';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  username: string;
  displayName: string;
}

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    client.post<ApiResponse<LoginResponse>>('/auth/login', data).then(r => r.data.data),

  getProfile: () =>
    client.get<ApiResponse<UserProfile>>('/auth/profile').then(r => r.data.data),
};

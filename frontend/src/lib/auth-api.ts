import api from './api';
import { User, Organization } from '@/types/models';
import { ApiResponse } from '@/types/api';
import { LoginInput, RegisterInput } from './validations/auth';

export const authApi = {
  login: async (data: LoginInput) => {
    const res = await api.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', data);
    return res.data.data;
  },
  register: async (data: RegisterInput) => {
    const res = await api.post<ApiResponse<{ user: User; org: Organization }>>('/auth/register', data);
    return res.data.data;
  },
  logout: async () => {
    const res = await api.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data.user;
  }
};

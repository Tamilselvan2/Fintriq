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
    const res = await api.post<ApiResponse<null>>('/auth/logout', undefined, {
      headers: {
        'X-CSRF-Token': '1',
      },
    });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data.user;
  },

  changePassword: async (data: any) => {
    const res = await api.patch<ApiResponse<null>>('/auth/password', data);
    return res.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const res = await api.post<ApiResponse<null>>('/auth/forgot-password', data);
    return res.data;
  },

  resetPassword: async (data: { token: string; password: string }) => {
    const res = await api.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data;
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await api.post<ApiResponse<{ user: User }>>('/auth/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data.user;
  }
};

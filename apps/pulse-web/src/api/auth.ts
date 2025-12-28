import apiClient from './client';
import type { AuthResponse, User, Organization, Token } from '../types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  organization_name?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<Token>('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  getCurrentOrganization: async (): Promise<Organization> => {
    const response = await apiClient.get<Organization>('/auth/me/organization');
    return response.data;
  },
};

export default authApi;

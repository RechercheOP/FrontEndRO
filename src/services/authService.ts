import apiClient from './apiClient';

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    data:string?;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
}

const authService = {
    // Connecter l'utilisateur
    // services/authService.ts

// Connecter l'utilisateur
login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await apiClient.post<LoginResponse>('/api/auth/login/', { username, password });
        console.log('Auth service login response:', response);
        
        // Si c'est directement la réponse qui contient access/refresh et non response.data
        if (response.access && response.refresh) {
            return response;
        }
        
        // Sinon, retourner response.data comme prévu
        return response.data;
    } catch (error) {
        console.error('Auth service login error:', error);
        throw error;
    }
}

    // Enregistrer un nouvel utilisateur
    register: async (userData: RegisterData): Promise<User> => {
        return await apiClient.post<User>('/api/auth/register/', userData);
    },

    // Rafraîchir le token
    refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
        return await apiClient.post<{ access: string }>('/api/auth/login/refresh/', { refresh: refreshToken });
    },

    // Déconnecter l'utilisateur
    logout: async (refreshToken: string): Promise<void> => {
        return await apiClient.post<void>('/api/auth/logout/', { refresh_token: refreshToken });
    },

    // Obtenir les informations de l'utilisateur connecté
    getCurrentUser: async (): Promise<User> => {
        return await apiClient.get<User>('/api/auth/me/');
    }
};

export default authService;
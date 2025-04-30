// services/apiClient.ts - Recodé intégralement
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 15000,
    });
    
    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Intercepteur pour les requêtes
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        
        // Ajouter le token d'authentification si disponible
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // IMPORTANT: NE PAS définir Content-Type pour FormData
        if (config.data instanceof FormData) {
          // Le navigateur s'occupera de définir le bon Content-Type avec boundary
          delete config.headers['Content-Type'];
          console.log('FormData détecté, Content-Type supprimé');
        } else if (typeof config.data === 'object' && config.data !== null && !Array.isArray(config.data)) {
          // Pour les objets JSON, définir explicitement application/json
          config.headers['Content-Type'] = 'application/json';
          console.log('Objet JSON détecté, Content-Type: application/json');
        }
        
        return config;
      },
      (error) => {
        console.error('Erreur dans l\'intercepteur de requête:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur pour les réponses
    this.client.interceptors.response.use(
      (response) => {
        // Retourner directement les données pour simplifier l'accès
        return response.data;
      },
      async (error) => {
        const originalRequest = error.config;
        
        // Si erreur 401 (non autorisé) et pas déjà essayé de rafraîchir
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
              // Pas de refresh token, déconnexion
              this.logout();
              return Promise.reject(error);
            }
            
            // Tenter de rafraîchir le token
            const response = await axios.post(
              `${this.client.defaults.baseURL}/api/auth/login/refresh/`,
              { refresh: refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (response.status === 200) {
              localStorage.setItem('authToken', response.data.access);
              
              // Réessayer avec le nouveau token
              originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('Échec du rafraîchissement de token:', refreshError);
            this.logout();
          }
        }
        
        // Journaliser les erreurs 415 pour le débogage
        if (error.response?.status === 415) {
          console.error('Erreur 415 - Type de média non pris en charge:', {
            url: originalRequest.url,
            method: originalRequest.method,
            headers: originalRequest.headers,
            data: originalRequest.data instanceof FormData 
              ? 'FormData (impossible d\'afficher le contenu)' 
              : originalRequest.data
          });
        }
        
        return Promise.reject(error);
      }
    );
  }

  private logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.client.get(url, config);
    } catch (error) {
      console.error(`GET ${url} a échoué:`, error);
      throw error;
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.client.post(url, data, config);
    } catch (error) {
      console.error(`POST ${url} a échoué:`, error);
      throw error;
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.client.put(url, data, config);
    } catch (error) {
      console.error(`PUT ${url} a échoué:`, error);
      throw error;
    }
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.client.patch(url, data, config);
    } catch (error) {
      console.error(`PATCH ${url} a échoué:`, error);
      throw error;
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      return await this.client.delete(url, config);
    } catch (error) {
      console.error(`DELETE ${url} a échoué:`, error);
      throw error;
    }
  }
}

export default ApiClient.getInstance();
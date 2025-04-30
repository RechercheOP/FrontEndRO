// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';  // Correction ici
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

interface JwtToken {
  user_id: number;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Vérifier si le token est présent et valide à l'initialisation
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!token || !refreshToken) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Vérifier si le token est expiré
        const decoded = jwtDecode<JwtToken>(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expiré, tentative de rafraîchissement
          try {
            const response = await apiClient.post('/api/auth/login/refresh/', {
              refresh: refreshToken
            });
            
            localStorage.setItem('authToken', response.data.access);
            
            // Charger les informations utilisateur
            await getUserInfo();
          } catch (refreshError) {
            // Échec du rafraîchissement, déconnexion
            handleLogout();
          }
        } else {
          // Token valide, charger les informations utilisateur
          await getUserInfo();
        }
      } catch (error) {
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Dans la méthode getUserInfo de AuthContext.tsx
// Modifiez le getUserInfo pour gérer différentes structures possibles
const getUserInfo = async () => {
  try {
    const response = await apiClient.get('/api/auth/me/');
    console.log('User info response:', response);
    
    // Vérifier la structure de la réponse et adapter
    let userData = response;
    
    // Si la réponse est dans .data (comme avec axios)
    if (response && typeof response === 'object' && response.data) {
      userData = response.data;
    }
    
    console.log('Processed user data:', userData);
    
    // Vérifier si l'objet user a les propriétés attendues
    if (userData && userData.id) {
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      console.error('Format de réponse utilisateur invalide:', userData);
      handleLogout();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    handleLogout();
  }
};

// Dans AuthContext.tsx, modifiez la fonction login:

const login = async (username: string, password: string) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await apiClient.post('/api/auth/login/', {
      username,
      password
    });
    
    console.log('API Response:', response); // Ajoutez ce log
    
    // Si response.data est undefined, utilisez response directement
    const responseData = response.data || response;
    console.log('Response data:', responseData);
    
    // Vérifiez si les propriétés existent avant de les utiliser
    const accessToken = responseData.access || responseData.token;
    const refreshToken = responseData.refresh || responseData.refresh_token;
    
    if (!accessToken) {
      throw new Error('Token d\'accès non trouvé dans la réponse');
    }
    
    localStorage.setItem('authToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    await getUserInfo();
    navigate('/app');
  } catch (error: any) {
    console.error('Erreur complète:', error);
    const errorMsg = error.response?.data?.detail || 'Erreur de connexion';
    setError(errorMsg);
    setIsAuthenticated(false);
  } finally {
    setLoading(false);
  }
};

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.post('/api/auth/register/', data);
      // Connexion automatique après inscription
      await login(data.username, data.password);
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = 'Erreur lors de l\'inscription';
      
      // Formatage des erreurs de validation
      if (errorData) {
        const errors = Object.entries(errorData)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        
        errorMessage = errors || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/api/auth/logout/', {
          refresh_token: refreshToken
        });
      }
      handleLogout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      handleLogout(); // Déconnecte quand même en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
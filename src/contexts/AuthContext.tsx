import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import config from '../config';

interface User {
  id: number;
  email: string;
  clinic_name: string;
  clinic_phone?: string;
  clinic_address?: string;
  contact_person?: string;
  subscription_type: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  clinic_name: string;
  clinic_phone?: string;
  clinic_address?: string;
  contact_person?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Проверяем токен при загрузке
  useEffect(() => {
    const storedToken = localStorage.getItem('vet_token');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.auth}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setToken(token);
        
        // Получаем полные данные профиля
        const profileResponse = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.auth}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUser(profileData);
        }
      } else {
        // Токен недействителен
        localStorage.removeItem('vet_token');
      }
    } catch (error) {
      console.error('Ошибка проверки токена:', error);
      localStorage.removeItem('vet_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.auth}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа в систему');
      }

      // Сохраняем токен
      localStorage.setItem('vet_token', data.token);
      setToken(data.token);
      setUser(data.user);

    } catch (error: any) {
      throw new Error(error.message || 'Ошибка входа в систему');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.auth}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      // Автоматический вход после регистрации
      localStorage.setItem('vet_token', data.token);
      setToken(data.token);
      setUser(data.user);

    } catch (error: any) {
      throw new Error(error.message || 'Ошибка регистрации');
    }
  };

  const logout = () => {
    localStorage.removeItem('vet_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';
import { toast } from 'sonner';

export type UserRole = 
  | 'SHOP_OWNER'
  | 'INVENTORY_MANAGER'
  | 'SALES_EXECUTIVE'
  | 'SYSTEM_ADMIN'
  | 'AUDITOR'
  | 'VENDOR'
   | 'CUSTOMER';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          id: decoded.sub,
          email: decoded.email || '',
          name: decoded.name || '',
          role: decoded.role || 'SALES_EXECUTIVE',
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Decode token only for ID/email — role comes from backend
      const decoded: any = jwtDecode(token);
      const userData: User = {
        id: decoded.sub,
        email: decoded.email || email,
        name: decoded.name || email.split('@')[0],
        role: role, // ✅ use backend-provided role here
      };

      setUser(userData);
      toast.success('Welcome back!');

      // Navigate to appropriate dashboard
      navigate(getDashboardRoute(role));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        name, 
        role 
      });
      
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getDashboardRoute = (role: UserRole): string => {
    switch (role) {
      case 'VENDOR':
        return '/dashboard';
      case 'AUDITOR':
        return '/dashboard'; // Auditor can access dashboard for overview
      case 'SALES_EXECUTIVE':
        return '/sales-terminal';
      case 'CUSTOMER':
        return '/customer-dashboard'; 
      default:
        return '/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@slib/api-client';

export interface User {
  id: number;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isLibrarian: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isLibrarian: false,
  checkAuth: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = () => {
    // Optionally call a backend /api/auth/logout if implemented
    // Or just clear cookies/localStorage if needed, though HttpOnly cookies are handled by browser
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isLibrarian = user?.roles.includes('Librarian') ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isLibrarian, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

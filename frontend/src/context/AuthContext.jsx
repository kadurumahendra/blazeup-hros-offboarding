import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR_ADMIN: 'HR_ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  ADMIN_SYSTEMS: 'ADMIN_SYSTEMS',
  ACCOUNTS: 'ACCOUNTS',
  PERSONNEL: 'PERSONNEL',
  EMPLOYEE: 'EMPLOYEE'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('blazeup_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('blazeup_token');
      const savedUser = localStorage.getItem('blazeup_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Verify with backend
          const res = await authService.getCurrentUser();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('blazeup_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Auth token verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data?.token && res.data?.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('blazeup_token', res.data.token);
      localStorage.setItem('blazeup_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('blazeup_token');
    localStorage.removeItem('blazeup_user');
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    if (user.role === ROLES.SUPER_ADMIN) return true;
    return roles.includes(user.role);
  };

  const isHR = () => hasRole(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR);
  const isHRAdmin = () => hasRole(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN);
  const isITAdmin = () => hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_SYSTEMS);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        hasRole,
        isHR,
        isHRAdmin,
        isITAdmin,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

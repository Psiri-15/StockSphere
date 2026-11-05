import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('stocksphere_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('stocksphere_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Session validation error:', err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('stocksphere_token');
        localStorage.removeItem('stocksphere_user');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('stocksphere_token', receivedToken);
      localStorage.setItem('stocksphere_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const registerCustomer = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('stocksphere_token', receivedToken);
      localStorage.setItem('stocksphere_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const registerSeller = async (data) => {
    const res = await api.post('/auth/register-seller', data);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('stocksphere_token', receivedToken);
      localStorage.setItem('stocksphere_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('stocksphere_token');
    localStorage.removeItem('stocksphere_user');
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('stocksphere_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('stocksphere_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        role: user?.role || 'Guest',
        isAdmin: user?.role === 'Admin',
        isSeller: user?.role === 'Seller',
        isCustomer: user?.role === 'Customer',
        sellerApproved: user?.role === 'Seller' && user?.sellerDetails?.approvalStatus === 'Approved',
        loading,
        login,
        registerCustomer,
        registerSeller,
        logout,
        updateProfile,
        uploadAvatar,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

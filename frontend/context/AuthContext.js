import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; 
import { useRouter } from 'next/router';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); 
  const router = useRouter();

  useEffect(() => {
    // This effect runs once on component mount (client-side)
    const loadUserFromStorage = async () => {
      const storedToken = localStorage.getItem('skillForgeToken');
      if (storedToken) {
        setToken(storedToken);
        // Set the token for future api calls immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          // Fetch user profile to validate token and get fresh user data
          const response = await api.get('/users/profile');
          setUser(response.data);
        } catch (error) {
          // Token might be invalid or expired
          console.error("Failed to fetch profile with stored token:", error);
          localStorage.removeItem('skillForgeToken');
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []); 

  const login = async (email, password) => {
    try {
      setLoading(true);
      // backend login endpoint is /api/users/login
      const response = await api.post('/users/login', { email, password });

      // backend returns: { id, name, email, token }
      if (response.data && response.data.token) {
        const { id, name, email: userEmail, token: userToken } = response.data;
        localStorage.setItem('skillForgeToken', userToken);
        setToken(userToken);
        setUser({ id, name, email: userEmail });
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        router.push('/dashboard/profile'); 
        return true;
      }
    } catch (error) {
      console.error("Login failed:", error.response ? error.response.data : error.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('skillForgeToken');
      delete api.defaults.headers.common['Authorization'];
      throw error;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      // backend register endpoint is /api/users/register
      const response = await api.post('/users/register', { name, email, password });

      // backend returns: { id, name, email, token }
      if (response.data && response.data.token) {
        const { id, name: userName, email: userEmail, token: userToken } = response.data;
        // Log the user in directly after successful registration
        localStorage.setItem('skillForgeToken', userToken);
        setToken(userToken);
        setUser({ id, name: userName, email: userEmail });
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        router.push('/dashboard/profile');
        return true;
      }
    } catch (error) {
      console.error("Registration failed:", error.response ? error.response.data : error.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('skillForgeToken');
      delete api.defaults.headers.common['Authorization'];
      throw error;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('skillForgeToken');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    router.push('/auth/login'); 
  };

  const authContextValue = {
    user,           // The user object { id, name, email, ... } or null
    token,          // The JWT string or null
    isAuthenticated: !!token, // Boolean: true if token exists, false otherwise
    login,
    register,
    logout,
    loading,        // Boolean: true while checking initial auth status or during login/register
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
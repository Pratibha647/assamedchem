import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate auth state on app load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('aasa_token');
      const storedUser = localStorage.getItem('aasa_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('aasa_token');
      localStorage.removeItem('aasa_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem('aasa_token', newToken);
    localStorage.setItem('aasa_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('aasa_token');
    localStorage.removeItem('aasa_user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const value = {
    user,
    token,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, getMe } from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kllao-token');
    if (token) {
      getMe(token)
        .then(({ user }) => setUser(user))
        .catch(() => localStorage.removeItem('kllao-token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { user, session } = await loginService(email, password);
    localStorage.setItem('kllao-token', session.access_token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('kllao-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

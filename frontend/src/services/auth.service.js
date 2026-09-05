import api from './api';

export const login = async (email, password) => {
  const { data } = await api.post('/api/auth', { email, password });
  return data;
};

export const getMe = async (token) => {
  const { data } = await api.get('/api/auth', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

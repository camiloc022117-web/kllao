import api from './api';

export const getCategories = () => api.get('/api/categories');
export const getCategoryById = (id) => api.get(`/api/categories?id=${id}`);
export const createCategory = (data) => api.post('/api/categories', data);
export const updateCategory = (id, data) => api.put(`/api/categories?id=${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/categories?id=${id}`);

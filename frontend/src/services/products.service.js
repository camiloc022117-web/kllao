import api from './api';

export const getProducts = () => api.get('/api/products');
export const getProductById = (id) => api.get(`/api/products?id=${id}`);
export const createProduct = (data) => api.post('/api/products', data);
export const updateProduct = (id, data) => api.put(`/api/products?id=${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/products?id=${id}`);

import api from './api';

export const getVariants = () => api.get('/api/variants');
export const getVariantById = (id) => api.get(`/api/variants?id=${id}`);
export const createVariant = (data) => api.post('/api/variants', data);
export const updateVariant = (id, data) => api.put(`/api/variants?id=${id}`, data);
export const deleteVariant = (id) => api.delete(`/api/variants?id=${id}`);

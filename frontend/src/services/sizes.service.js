import api from './api';

export const getSizes = () => api.get('/api/sizes');
export const getSizeById = (id) => api.get(`/api/sizes?id=${id}`);
export const createSize = (data) => api.post('/api/sizes', data);
export const updateSize = (id, data) => api.put(`/api/sizes?id=${id}`, data);
export const deleteSize = (id) => api.delete(`/api/sizes?id=${id}`);

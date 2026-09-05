import api from './api';

export const getSales = () => api.get('/api/sales');
export const getSaleById = (id) => api.get(`/api/sales?id=${id}`);
export const createSale = (data) => api.post('/api/sales', data);
export const getSalesByDateRange = (start, end) =>
  api.get(`/api/sales?start=${start}&end=${end}`);

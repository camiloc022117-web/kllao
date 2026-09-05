import api from './api';

export const getStockEntries = () => api.get('/api/stock-entries');
export const getStockEntryById = (id) => api.get(`/api/stock-entries?id=${id}`);
export const createStockEntry = (data) => api.post('/api/stock-entries', data);

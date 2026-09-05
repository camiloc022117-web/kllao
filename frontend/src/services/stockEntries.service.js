import api from './api'

export const getStockEntries = () => api.get ('/stock-entries')
export const getStockEntryById = (id) => api.get(`/stock-entries/${id}`)
export const createStockEntry = (data) => api.post('/stock-entries', data)
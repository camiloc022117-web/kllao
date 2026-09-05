import api from './api'

export const getVariants = () => api.get('/variants')
export const createVariant = (data) => api.post('/variants', data)
export const updateVariant = (id, data) => api.put(`/variants/${id}`, data)
export const deleteVariant = (id) => api.delete(`/variants/${id}`)

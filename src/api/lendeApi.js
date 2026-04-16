import api from './axios';

const BASE = 'http://localhost:8000/api';

export function getLende(filters = {}) {
  const params = new URLSearchParams();
  if (filters.dep_id)      params.append('dep_id', filters.dep_id);
  if (filters.viti)        params.append('viti', filters.viti);
  if (filters.semestri)    params.append('semestri', filters.semestri);
  if (filters.kurr_ver_id) params.append('kurr_ver_id', filters.kurr_ver_id);
  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get(`${BASE}/lende${query}`);
}

export function getLendeById(id) {
  return api.get(`${BASE}/lende/${id}`);
}

export function createLende(data) {
  return api.post(`${BASE}/lende`, data);
}

export function updateLende(id, data) {
  return api.put(`${BASE}/lende/${id}`, data);
}

export function deleteLende(id) {
  return api.delete(`${BASE}/lende/${id}`);
}

export function getPedagogetELendes(id) {
  return api.get(`${BASE}/lende/${id}/pedagoget`);
}

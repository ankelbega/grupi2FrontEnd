import api from './axios';

const BASE = 'http://localhost:8000/api';

export function getPrograme(filters = {}) {
  const params = new URLSearchParams();
  if (filters.dep_id) params.append('dep_id', filters.dep_id);
  if (filters.niveli) params.append('niveli', filters.niveli);
  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get(`${BASE}/programe${query}`);
}

export function getProgramiById(id) {
  return api.get(`${BASE}/programe/${id}`);
}

export function createProgram(data) {
  return api.post(`${BASE}/programe`, data);
}

export function updateProgram(id, data) {
  return api.put(`${BASE}/programe/${id}`, data);
}

export function deleteProgram(id) {
  return api.delete(`${BASE}/programe/${id}`);
}

export function getLendeProgramit(id) {
  return api.get(`${BASE}/programe/${id}/lende`);
}

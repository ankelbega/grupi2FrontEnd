import api from './axiosInstance';
import { API_BASE as BASE } from '../config/constants';

export function getPedagoget(filters = {}) {
  const params = new URLSearchParams();
  if (filters.dep_id) params.append('dep_id', filters.dep_id);
  if (filters.kontrata) params.append('kontrata', filters.kontrata);
  return api.get(`${BASE}/pedagoget?${params.toString()}`);
}

export function getPedagogById(id) {
  return api.get(`${BASE}/pedagoget/${id}`);
}

export function getPedagogLende(id, sem_id) {
  return api.get(`${BASE}/pedagoget/${id}/lende?sem_id=${sem_id}`);
}

export function getPedagogOrari(id, sem_id) {
  const params = sem_id ? `?sem_id=${sem_id}` : '';
  return api.get(`${BASE}/pedagoget/${id}/orari${params}`);
}

export function createPedagog(data) {
  return api.post(`${BASE}/pedagoget`, data);
}

export function updatePedagog(id, data) {
  return api.put(`${BASE}/pedagoget/${id}`, data);
}

export function deletePedagog(id) {
  return api.delete(`${BASE}/pedagoget/${id}`);
}

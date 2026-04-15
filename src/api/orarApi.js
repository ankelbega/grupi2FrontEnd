import api from './axios';

const BASE = 'http://localhost:8000/api';

export const getOrare = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.ped_id)      params.append('ped_id',      filters.ped_id);
  if (filters.salle_id)    params.append('salle_id',    filters.salle_id);
  if (filters.sem_id)      params.append('sem_id',      filters.sem_id);
  if (filters.dita)        params.append('dita',        filters.dita);
  if (filters.kurr_ver_id) params.append('kurr_ver_id', filters.kurr_ver_id);
  return api.get(`${BASE}/orare?${params.toString()}`);
};

export const getOrarById = (id) =>
  api.get(`${BASE}/orare/${id}`);

export const createOrar = (data) =>
  api.post(`${BASE}/orare`, data);

export const updateOrar = (id, data) =>
  api.put(`${BASE}/orare/${id}`, data);

export const deleteOrar = (id) =>
  api.delete(`${BASE}/orare/${id}`);

export const kontrolloKonfliktet = (data) =>
  api.post(`${BASE}/orare/kontrollo`, data);

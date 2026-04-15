import api from './axios';

const BASE = 'http://localhost:8000/api';

export const getSeksionet = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.sem_id) params.append('sem_id', filters.sem_id);
  if (filters.ped_id) params.append('ped_id', filters.ped_id);
  if (filters.len_id) params.append('len_id', filters.len_id);
  return api.get(`${BASE}/seksione?${params.toString()}`);
};

export const getSeksionById = (id) =>
  api.get(`${BASE}/seksione/${id}`);

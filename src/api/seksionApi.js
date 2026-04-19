import api from './axiosInstance';
import { API_BASE as BASE } from '../config/constants';

export const getSeksionet = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.sem_id) params.append('sem_id', filters.sem_id);
  if (filters.ped_id) params.append('ped_id', filters.ped_id);
  if (filters.len_id) params.append('len_id', filters.len_id);
  return api.get(`${BASE}/seksione?${params.toString()}`);
};

export const getSeksionById = (id) =>
  api.get(`${BASE}/seksione/${id}`);

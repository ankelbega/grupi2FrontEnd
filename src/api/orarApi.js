import axiosInstance from './axiosInstance';
import { API_BASE } from '../config/constants';

export async function getOrare(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await axiosInstance.get(`${API_BASE}/orare${query}`);
  return response.data?.data ?? response.data;
}

export async function getOrarById(id) {
  const response = await axiosInstance.get(`${API_BASE}/orare/${id}`);
  return response.data?.data ?? response.data;
}

export async function createOrar(data) {
  try {
    const response = await axiosInstance.post(`${API_BASE}/orare`, data);
    return response.data?.data ?? response.data;
  } catch (error) {
    const json = error.response?.data ?? {};
    const errorMsg = json.mesazh ?? json.message ?? 'Gabim gjate ruajtjes';
    const konflikte = json.konflikte ?? [];
    throw new Error(konflikte.length > 0 ? konflikte.join('\n') : errorMsg);
  }
}

export async function updateOrar(id, data) {
  try {
    const response = await axiosInstance.put(`${API_BASE}/orare/${id}`, data);
    return response.data?.data ?? response.data;
  } catch (error) {
    const json = error.response?.data ?? {};
    const errorMsg = json.mesazh ?? json.message ?? 'Gabim gjate ruajtjes';
    const konflikte = json.konflikte ?? [];
    throw new Error(konflikte.length > 0 ? konflikte.join('\n') : errorMsg);
  }
}

export async function deleteOrar(id) {
  try {
    const response = await axiosInstance.delete(`${API_BASE}/orare/${id}`);
    return response.data;
  } catch (error) {
    const json = error.response?.data ?? {};
    throw new Error(json.message ?? 'Failed to delete orar');
  }
}

export async function kontrolloKonfliktet(data) {
  const response = await axiosInstance.post(`${API_BASE}/orare/kontrollo`, data);
  return response.data;
}

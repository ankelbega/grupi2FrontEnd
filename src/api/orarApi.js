import { API_BASE, authHeaders } from '../config/constants';

export async function getOrare(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const url = `${API_BASE}/orare${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch orare');
  const json = await res.json();
  return json.data ?? json;
}

export async function getOrarById(id) {
  const res = await fetch(`${API_BASE}/orare/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch orar');
  const json = await res.json();
  return json.data ?? json;
}

export async function createOrar(data) {
  const res = await fetch(`${API_BASE}/orare`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.mesazh ?? json.message ?? 'Gabim gjate ruajtjes';
    const konflikte = json.konflikte ?? [];
    const fullMsg = konflikte.length > 0 ? konflikte.join('\n') : errorMsg;
    throw new Error(fullMsg);
  }
  return json.data ?? json;
}

export async function updateOrar(id, data) {
  const res = await fetch(`${API_BASE}/orare/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.mesazh ?? json.message ?? 'Gabim gjate ruajtjes';
    const konflikte = json.konflikte ?? [];
    const fullMsg = konflikte.length > 0 ? konflikte.join('\n') : errorMsg;
    throw new Error(fullMsg);
  }
  return json.data ?? json;
}

export async function deleteOrar(id) {
  const res = await fetch(`${API_BASE}/orare/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to delete orar');
  return json;
}

export async function kontrolloKonfliktet(data) {
  const res = await fetch(`${API_BASE}/orare/kontrollo`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json;
}
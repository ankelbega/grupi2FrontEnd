const API_BASE = 'http://localhost:8000/api';

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
}

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
  if (!res.ok) throw new Error(json.message ?? 'Failed to create orar');
  return json.data ?? json;
}

export async function updateOrar(id, data) {
  const res = await fetch(`${API_BASE}/orare/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to update orar');
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
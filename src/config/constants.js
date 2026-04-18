export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const DAYS = [
  { key: 1, label: 'E Hënë' },
  { key: 2, label: 'E Martë' },
  { key: 3, label: 'E Mërkurë' },
  { key: 4, label: 'E Enjte' },
  { key: 5, label: 'E Premte' },
];

export const TIME_SLOTS = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '17:30', '19:00', '20:30'];

export const SALLET = [
  { id: 1, name: 'Salla A101' },
  { id: 2, name: 'Salla A102' },
  { id: 3, name: 'Salla A103' },
  { id: 4, name: 'Salla A104' },
  { id: 5, name: 'Salla B101' },
  { id: 6, name: 'Salla B102' },
  { id: 7, name: 'Salla B103' },
  { id: 8, name: 'Salla B104' },
];

export const LLOJI_COLORS = {
  ligjerata: { bg: '#e6f4ff', border: '#1677ff', tagColor: 'blue', label: 'L' },
  seminar: { bg: '#f6ffed', border: '#52c41a', tagColor: 'green', label: 'S' },
  laborator: { bg: '#fff7e6', border: '#fa8c16', tagColor: 'orange', label: 'Lab' },
};

export const LLOJI_OPTIONS = [
  { value: 'ligjerata', label: 'Ligjëratë' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'laborator', label: 'Laborator' },
];

export const SEMESTRAT = [1, 2, 3, 4, 5, 6].map((i) => ({ SEM_ID: i, SEM_EM: `Semestri ${i}` }));

export const VITET = [1, 2, 3, 4];

export function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
}

// src/api.js
const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const authFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};
export const fetchPatients = async (service) => {
  console.log('fetchPatients called with service:', service);
  return authFetch(`/patients?service=${encodeURIComponent(service)}`);
};
export const fetchServices = () => authFetch('/services/distinct');
export const fetchYears = () => authFetch('/years/distinct');

export const createPatient = (data) => authFetch('/patients', { method: 'POST', body: JSON.stringify(data) });
export const updatePatient = (id, data) => authFetch(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePatient = (id) => authFetch(`/patients/${id}`, { method: 'DELETE' });
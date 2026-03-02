import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',   // ← ton backend Django
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter le token automatiquement si connecté
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
// src/config/api.ts
const API_URL = import.meta.env.PROD
  ? 'https://flowshop-qbsolver.onrender.com/api'  // Add /api to the end
  : '/api';

export const getApiUrl = (endpoint: string) => `${API_URL}${endpoint}`;
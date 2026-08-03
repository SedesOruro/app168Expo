export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || `${API_URL}/storage/file`;
export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'auth_token';
export const EDITOR_API_KEY = import.meta.env.VITE_EDITOR_API_KEY || '';

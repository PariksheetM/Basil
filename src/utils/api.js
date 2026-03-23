/**
 * Central API base URL.
 * - In development:  http://localhost:8000/api   (from .env.local or fallback)
 * - In production:   set VITE_API_BASE_URL in .env.production
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

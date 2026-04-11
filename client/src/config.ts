/**
 * Global Configuration for the PulseNode Frontend
 */

// The base URL for the backend API.
// In production (same-origin deployment), use "" so fetch calls are relative.
// Locally, use http://localhost:4000.
const isDev = import.meta.env.DEV;

export const API_BASE_URL = import.meta.env.VITE_API_URL || (isDev ? "http://localhost:4000" : "");

export const API_URL = `${API_BASE_URL}/api`;

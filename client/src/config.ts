/**
 * Global Configuration for the PulseNode Frontend
 */

// The base URL for the backend API.
// In production (Railway), this should be provided as VITE_API_URL.
// Locally it defaults to http://localhost:4000.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const API_URL = `${API_BASE_URL}/api`;

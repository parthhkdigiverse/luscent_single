const isProd = import.meta.env.PROD;
const hostname = window.location.hostname;
const protocol = window.location.protocol;

let apiUrl = import.meta.env.VITE_API_URL;

// If accessing locally via an IP (e.g., mobile testing) but API_URL is set to localhost, fix it dynamically
if (!isProd && apiUrl && apiUrl.includes("localhost") && hostname !== "localhost") {
  apiUrl = `${protocol}//${hostname}:8080`;
}

// Fallback to relative path in production, or dynamic local URL in development
export const API_URL = apiUrl || (isProd ? "" : `${protocol}//${hostname}:8080`);

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

if (!apiBaseUrl) {
  throw new Error('VITE_API_URL must be defined in frontend/.env');
}

export function apiUrl(path) {
  return `${apiBaseUrl}/${path.replace(/^\/+/, '')}`;
}

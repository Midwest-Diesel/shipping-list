import axios from 'axios';

const getUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://mwd-server-staging.up.railway.app';
    return 'https://inventory-server.up.railway.app';
  } else {
    return 'http://localhost:8000';
  }
};

const baseURL = getUrl();

const api = axios.create({
  baseURL,
  withCredentials: true
});

export const setApiBaseUrl = (url: string) => {
  api.defaults.baseURL = url;
};

export default api;

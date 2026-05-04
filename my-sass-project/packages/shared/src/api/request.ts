import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (res) => res.data,
  (error) => Promise.reject(error)
);

export default request;

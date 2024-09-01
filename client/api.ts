import axios from 'axios';
import { getConfig } from '../config';
import ConfigError from '../common/ConfigError';
import { getCookie } from 'cookies-next';
import { logout } from './logout';

let { apiUrl } = getConfig();

if (!apiUrl) {
  throw new ConfigError("The required environment variable API_URL is not. Please make sure that the required environment variables are set correctly in your next.config file")
}

// Add a request interceptor
const headers = () => {
  const token = getCookie('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
}



const api = {
  get: async (path: string) => {
    try {
      const { data } = await axios.get(`${apiUrl}${path}`, headers());
      return data;
    } catch (error: any) {
      const statusCode = error?.response?.status;
      if (statusCode === 401) {
        logout();
      }
      return error?.response?.data;
    }
  },
  post: async (path: string, data: any) => {
    try {
      const result = await axios.post(`${apiUrl}${path}`, data, headers());
      return result?.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  },
  put: async (path: string, data: any) => {
    try {
      const result = await axios.put(`${apiUrl}${path}`, data, headers());
      return result?.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  },
  delete: async (path: string) => {
    try {
      const result = await axios.delete(`${apiUrl}${path}`, headers());
      return result?.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  }
};

export default api;
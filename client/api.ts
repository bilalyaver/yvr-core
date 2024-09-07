import axios from 'axios';
import { getConfig } from '../config';
import { getCookie } from 'cookies-next';
import { logout } from './logout';

let { apiKey } = getConfig();



// Add a request interceptor
const headers = () => {
  const token = getCookie('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
}


const api = {
  get: async (path: string) => {
    try {
      const { data } = await axios.get(`/admin/api/${path}`, headers());
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
      const result = await axios.post(`/admin/api/${path}`, data, headers());
      return result?.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  },
  put: async (path: string, data: any) => {
    try {
      const result = await axios.put(`/admin/api/${path}`, data, headers());
      return result?.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  },
  delete: async (path: string) => {
    try {
      const result = await axios.delete(`/admin/api/${path}`, headers());
      return result?.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  }
};

export default api;
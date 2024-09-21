import { deleteCookie } from 'cookies-next';

export const logout = async () => {
  deleteCookie('token');
  window.location.href = '/login';
};
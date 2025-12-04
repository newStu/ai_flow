import { alova } from './api';

export const login = (credentials: any) => {
  return alova.Post('api/auth/login', credentials);
};

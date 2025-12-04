import { alova } from './api';

export const login = (credentials: any) => {
  return alova.Post('/auth/login', credentials);
};

import api from './api';

export const companyService = {
  getProfile: () => api.get('/company/profile'),
};

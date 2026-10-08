import api from './api';

export const collegeService = {
  getActiveColleges: () => api.get('/colleges'),
};

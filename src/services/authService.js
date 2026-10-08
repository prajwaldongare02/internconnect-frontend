import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => {
    const { role, name, department, ...rest } = userData;
    if (role === 'STUDENT') {
      const [firstName, ...lastName] = name.trim().split(/\s+/);
      return api.post('/auth/register/student', { ...rest, firstName, lastName: lastName.join(' ') || 'Student', branch: department });
    }
    return api.post('/auth/register/company', { ...rest, name });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => !!localStorage.getItem('token'),

};

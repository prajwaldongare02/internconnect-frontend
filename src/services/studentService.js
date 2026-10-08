import api from './api';

export const studentService = {
  // Placement Officer gets students from their own college; Admin gets all students.
  search: (params = {}, role) =>
    role === 'ADMIN'
      ? api.get('/admin/students', { params })
      : api.get('/officer/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
};

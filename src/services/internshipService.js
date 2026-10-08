import api from './api';

export const internshipService = {
  getAll: () => api.get('/internships/public/all'),
  getById: (id) => api.get(`/internships/public/${id}`),
  create: (data) => api.post('/company/internships', toBackendPayload(data)),
  update: (id, data) => api.put(`/company/internships/${id}`, toBackendPayload(data)),
  delete: (id) => api.delete(`/company/internships/${id}`),
  getMine: () => api.get('/company/internships'),
  search: (query) => api.get('/internships/public/search', { params: { keyword: query } }),

  // College-scoped approval workflow: a company's posting is visible to
  // every Placement Officer, and each TPO chooses whether to open it up
  // to students at their own college.
  approveForCollege: (id) => api.put(`/officer/internships/${id}/approve`),
  rejectForCollege: (id) => api.put(`/officer/internships/${id}/reject`),
};

const toBackendPayload = (data) => ({
  title: data.title,
  description: data.description,
  requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : data.requirements,
  responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.join('\n') : data.responsibilities,
  skills: Array.isArray(data.skills) ? data.skills.join(',') : data.skills,
  perks: Array.isArray(data.perks) ? data.perks.join('\n') : data.perks,
  location: data.location,
  mode: data.type || data.mode,
  duration: Number.parseInt(data.duration, 10) || 3,
  stipend: Number(String(data.stipend || '0').replace(/[^0-9.]/g, '')) || 0,
  stipendCurrency: 'INR', openings: data.openings || 1,
  applicationDeadline: data.deadline || data.applicationDeadline,
  startDate: data.startDate || null, endDate: data.endDate || null,
});

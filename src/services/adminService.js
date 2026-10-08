import api from './api';

export const adminService = {
  // ---- Colleges ----
  getColleges: () => api.get('/admin/colleges'),
  createCollege: (data) => api.post('/admin/colleges', data),
  toggleCollegeStatus: (id, active) => api.put(`/admin/colleges/${id}/status`, { active }),

  // ---- Placement Officers (TPOs) — each TPO is assigned to one Admin-created college ----
  getPlacementOfficers: (params) => api.get('/admin/placement-officers', { params }),
  createPlacementOfficer: (data) => api.post('/admin/placement-officers', data),
  updatePlacementOfficer: (id, data) => api.put(`/admin/placement-officers/${id}`, data),
  deletePlacementOfficer: (id) => api.delete(`/admin/placement-officers/${id}`),
  togglePlacementOfficerStatus: (id, isActive) =>
    api.put(`/admin/placement-officers/${id}/status`, { isActive }),

  // ---- Companies ----
  getCompanies: (params) => api.get('/admin/companies', { params }),
  updateCompanyStatus: (id, status) => api.put(`/admin/companies/${id}/status`, { status }),

  // ---- Students ----
  getStudents: (params) => api.get('/admin/students', { params }),

  // ---- Internships ----
  getInternships: () => api.get('/admin/internships'),

  // ---- Reports ----
  getReports: () => api.get('/admin/reports'),
};

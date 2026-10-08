import api from './api';

export const placementOfficerService = {
  // Internships posted by companies that this TPO hasn't yet decided on
  // for their own college.
  getPendingInternships: () => api.get('/officer/internships/pending'),
  getApprovedInternships: () => api.get('/officer/internships/approved'),

  // TPO decides whether an internship posted by a company is opened up
  // to students of their specific college.
  approveInternship: (internshipId) => api.put(`/officer/internships/${internshipId}/approve`),
  rejectInternship: (internshipId) => api.put(`/officer/internships/${internshipId}/reject`),

  getCollegeApplications: () => api.get('/officer/applications'),
};

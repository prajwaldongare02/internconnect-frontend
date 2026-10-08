import api, { API_BASE_URL } from './api';

export const applicationService = {
  apply: (internshipId, { coverLetter = '', resume }) => {
    const formData = new FormData();
    formData.append('internshipId', String(Number(internshipId)));
    formData.append('coverLetter', coverLetter || '');
    formData.append('resume', resume);
    return api.post('/student/apply', formData);
  },
  getMyApplications: () => api.get('/student/applications'),
  getApplicationsForCompany: () => api.get('/company/applications'),
  updateStatus: (id, status) => api.patch(`/company/applications/${id}/status`, null, { params: { status } }),
  getById: (id) => api.get(`/applications/${id}`),
  withdraw: (id) => api.delete(`/student/applications/${id}/withdraw`),
  getResumeUrl: (resumeUrl) => {
    if (!resumeUrl) return '';
    if (/^https?:\/\//i.test(resumeUrl)) return resumeUrl;
    return `${API_BASE_URL.replace(/\/api$/, '')}${resumeUrl.startsWith('/') ? resumeUrl : `/${resumeUrl}`}`;
  },
};

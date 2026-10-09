import api, { API_BASE_URL } from './api';

export const applicationService = {
  apply: async (internshipId, { coverLetter = '', resume }) => {
    // 1. Upload the resume file to Cloudinary via ResumeController
    const fileData = new FormData();
    fileData.append('file', resume);

    const uploadRes = await api.post('/resumes/upload', fileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const resumeUrl = uploadRes.data.url;

    // 2. Submit the application payload with the Cloudinary URL
    return api.post('/student/apply', {
      internshipId: Number(internshipId),
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl,
    });
  },

  getMyApplications: () => api.get('/student/applications'),
  getApplicationsForCompany: () => api.get('/company/applications'),
  updateStatus: (id, status) => api.patch(`/company/applications/${id}/status`, null, { params: { status } }),
  getById: (id) => api.get(`/applications/${id}`),
  withdraw: (id) => api.delete(`/student/applications/${id}/withdraw`),

  getResumeUrl: (resumeUrl) => {
    if (!resumeUrl) return '';
    // If it's already a Cloudinary HTTPS link, return it directly
    if (/^https?:\/\//i.test(resumeUrl)) return resumeUrl;
    return `${API_BASE_URL.replace(/\/api$/, '')}${resumeUrl.startsWith('/') ? resumeUrl : `/${resumeUrl}`}`;
  },
};
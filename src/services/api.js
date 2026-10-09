import axios from 'axios';

export const API_BASE_URL = 'https://internconnect-backend-production-5084.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    // Let Axios/browser set the multipart boundary for file uploads.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    // Spring Boot wraps every successful payload in ApiResponse. Keep the
    // axios response shape expected by the pages, but expose its real data.
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = normalize(response.data.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

const normalize = (value) => {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== 'object') return value;
  const item = { ...value };
  if (item.firstName && !item.fullName) item.fullName = `${item.firstName} ${item.lastName || ''}`.trim();
  if (item.branch && !item.department) item.department = item.branch;
  if (typeof item.skills === 'string') item.skills = item.skills.split(',').map(s => s.trim()).filter(Boolean);
  if (item.company) item.companyName = item.company.name;
  if (item.mode && !item.type) item.type = item.mode;
  if (item.applicationDeadline && !item.deadline) item.deadline = item.applicationDeadline;
  if (item.createdAt && !item.postedAt) item.postedAt = item.createdAt.slice(0, 10);
  if (item.internship) {
    item.internshipTitle = item.internship.title;
    item.companyName = item.internship.company?.name;
    item.location = item.internship.location;
    item.type = item.internship.mode;
  }
  if (item.student) item.studentName = `${item.student.firstName} ${item.student.lastName || ''}`.trim();
  if (item.appliedAt && typeof item.appliedAt === 'string') item.appliedAt = item.appliedAt.slice(0, 10);
  return item;
};

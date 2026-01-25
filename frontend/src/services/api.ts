import axios, { AxiosInstance, AxiosError } from 'axios';

export interface APIError {
  message: string;
  status?: number;
}

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new APIClient();

// Auth services
export const authService = {
  register: (data: { 
    email: string; 
    password: string; 
    name: string;
    college: string;
    branch: string;
    yearOfGraduation: number;
  }) => apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data: any) => apiClient.put('/auth/profile', data),
  linkSocial: (platform: string, data: any) =>
    apiClient.post('/auth/social-link', { platform, data }),
};

// DSA services
export const dsaService = {
  getSheet: (sheetName: string) => apiClient.get(`/dsa/sheet/${sheetName}`),
  trackProblem: (data: any) => apiClient.post('/dsa/track', data),
  addApproach: (data: any) => apiClient.post('/dsa/approach', data),
  getAIFeedback: (data: any) => apiClient.post('/dsa/feedback', data),
  getProgress: (sheetName?: string) =>
    apiClient.get(`/dsa/progress${sheetName ? `?sheetName=${sheetName}` : ''}`),
  getSuggestions: () => apiClient.get('/dsa/suggestions'),
};

// Resume services
export const resumeService = {
  generate: () => apiClient.post('/resume/generate'),
  getVersions: () => apiClient.get('/resume/versions'),
  getVersion: (versionNumber: number) =>
    apiClient.get(`/resume/version/${versionNumber}`),
  optimizeForRole: (versionNumber: number, targetRole: string) => 
    apiClient.post('/resume/optimize', { versionNumber, targetRole }),
  calculateATSScore: (versionNumber: number) => 
    apiClient.post('/resume/ats-score', { versionNumber }),
  syncProfiles: (profiles: {
    github?: string;
    leetcode?: string;
    codeforces?: string;
    linkedin?: string;
  }) => apiClient.post('/resume/sync', profiles),
};

// Research services
export const researchService = {
  create: (data: any) => apiClient.post('/research/create', data),
  getAll: () => apiClient.get('/research'),
  get: (projectId: string) => apiClient.get(`/research/${projectId}`),
  update: (projectId: string, data: any) =>
    apiClient.put(`/research/${projectId}`, data),
  delete: (projectId: string) =>
    apiClient.delete(`/research/${projectId}`),
  updateStatus: (projectId: string, status: string) =>
    apiClient.patch(`/research/${projectId}/status`, { status }),
  summarize: (projectId: string) =>
    apiClient.post(`/research/${projectId}/summarize`, {}),
  findRelatedWorks: (projectId: string) =>
    apiClient.post(`/research/${projectId}/related-works`, {}),
  generateMethodology: (projectId: string, data: any) =>
    apiClient.post(`/research/${projectId}/methodology`, data),
  generateLiteratureReview: (projectId: string) =>
    apiClient.post(`/research/${projectId}/literature-review`, {}),
  generateAbstract: (projectId: string) =>
    apiClient.post(`/research/${projectId}/abstract`, {}),
  generateIntroduction: (projectId: string) =>
    apiClient.post(`/research/${projectId}/introduction`, {}),
  recommendPapers: (studentPrompt: string) =>
    apiClient.post('/research/recommend-papers', { studentPrompt }),
  export: (projectId: string, format: string) =>
    apiClient.get(`/research/${projectId}/export/${format}`),
};

// Interview services
export const interviewService = {
  startInterview: (data: any) => apiClient.post('/interview/start', data),
  submitAnswer: (data: any) => apiClient.post('/interview/submit-answer', data),
  getHistory: () => apiClient.get('/interview/history'),
  getMentorResponse: (data: any) =>
    apiClient.post('/interview/mentor/response', data),
  getInsights: () => apiClient.get('/interview/mentor/insights'),
};

// Roadmap services
export const roadmapService = {
  generate: (data: any) => apiClient.post('/roadmap/generate', data),
  get: (role?: string) =>
    apiClient.get(`/roadmap${role ? `?role=${role}` : ''}`),
  updateMilestone: (data: any) =>
    apiClient.post('/roadmap/update-milestone', data),
  adapt: (roadmapId: string) => apiClient.post(`/roadmap/${roadmapId}/adapt`),
  delete: (roadmapId: string) => apiClient.delete(`/roadmap/${roadmapId}`),
};

export default apiClient;

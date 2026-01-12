import axios, { AxiosError } from 'axios';

// Use backend URL directly to avoid Next.js rewrite issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
  maxRedirects: 5,
});

// Request interceptor - Add JWT token and log request URL
api.interceptors.request.use(
  (config) => {
    console.log('[API Request] Full URL:', (config.baseURL || '') + (config.url || ''));
    console.log('[API Request] baseURL:', config.baseURL);
    console.log('[API Request] url:', config.url);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const formBody = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const response = await api.post('/api/auth/login', formBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (email: string, username: string, password: string) => {
    const response = await api.post('/api/auth/register', {
      email,
      username,
      password,
    });
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  list: async (filters?: { status?: string; priority?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);

    const queryString = params.toString();
    const url = queryString ? `/api/tasks/?${queryString}` : '/api/tasks/';
    console.log('[API] Fetching tasks from:', url);
    console.log('[API] Base URL:', API_BASE_URL);
    const response = await api.get(url);
    console.log('[API] Response data:', response.data);
    return response.data;
  },

  create: async (data: { title: string; description?: string; priority?: string }) => {
    const response = await api.post('/api/tasks/', data);
    return response.data;
  },

  update: async (id: number, data: { title?: string; description?: string; status?: string; priority?: string }) => {
    const response = await api.put(`/api/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },

  complete: async (id: number) => {
    const response = await api.post(`/api/tasks/${id}/complete`);
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/api/tasks/summary/overview');
    return response.data;
  },
};

// AI Chat API
export const aiApi = {
  sendMessage: async (message: string, verbose = false) => {
    const response = await api.post('/api/ai/chat', { message, verbose });
    return response.data;
  },

  sendMessageStream: async (
    message: string,
    onChunk: (chunk: string) => void,
    onDone: (result: any) => void,
    onError: (error: string) => void,
    verbose = false
  ) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    if (!token) {
      onError('Not authenticated');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message, verbose }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is null');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'token') {
                onChunk(data.content);
              } else if (data.type === 'done') {
                onDone(data);
              } else if (data.type === 'error') {
                onError(data.message);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      onError(error.message || 'Failed to send message');
    }
  },

  getHistory: async (limit = 100) => {
    const response = await api.get(`/api/ai/history?limit=${limit}`);
    return response.data;
  },

  clearHistory: async (days = 30) => {
    const response = await api.delete(`/api/ai/history?days=${days}`);
    return response.data;
  },
};

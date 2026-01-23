import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Adjust if your backend port differs
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to unwrap standardized { data, message } format
api.interceptors.response.use(
    (response) => {
        // If the backend returns our standard format, unwrapping it
        if (response.data && response.data.data !== undefined) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        // Standardizing error messages
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        const message = error.response?.data?.error || 'An unexpected error occurred';
        return Promise.reject(new Error(message));
    }
);

export default api;

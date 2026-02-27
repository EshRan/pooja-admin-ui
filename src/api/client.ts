import axios from 'axios';

// In production (npm run build), use the hardcoded AWS EC2 IP
// In development (npm run dev), use '' so the Vite proxy handles it and prevents CORS errors
const baseURL = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add auth token if needed in the future
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            // Note: We'll implement a simple frontend auth layer for now
        }
        return Promise.reject(error);
    }
);

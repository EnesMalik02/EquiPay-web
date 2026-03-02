import axios from "axios";
import { API_BASE_URL } from "../config";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401, we haven't retried yet, and we are not trying to refresh token itself
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh-token") {
            originalRequest._retry = true;
            try {
                const accessToken = localStorage.getItem("access_token");

                // Request to refresh token using the current access_token as requested
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    access_token: accessToken,
                });

                // Save new tokens
                localStorage.setItem("access_token", data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem("refresh_token", data.refresh_token);
                }

                // Update headers for the retry request
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear tokens and redirect to login
                if (typeof window !== "undefined") {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/auth/login"; // Or /login depending on the actual route
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

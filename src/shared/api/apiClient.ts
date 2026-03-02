import axios from "axios";

const API_BASE_URL = "/api";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies with cross-origin requests
    headers: {
        "Content-Type": "application/json",
        "x-platform": "web"
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401, we haven't retried yet, and we are not trying to refresh token itself
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
            originalRequest._retry = true;
            try {
                // Request to refresh token using the HttpOnly cookie automatically sent by withCredentials
                await apiClient.post(`/auth/refresh`);

                // Retry the original request (New cookie is automatically attached)
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                if (typeof window !== "undefined") {
                    window.location.href = "/auth/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

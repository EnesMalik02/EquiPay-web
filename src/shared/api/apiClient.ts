import axios from "axios";

const API_BASE_URL = "/api";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "x-platform": "web",
    },
});

let isRefreshing = false;

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh")
        ) {
            if (isRefreshing) return Promise.reject(error);

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await apiClient.post("/auth/refresh");
                isRefreshing = false;
                return apiClient(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                if (typeof window !== "undefined") {
                    await fetch("/api/auth/clear-session", { method: "POST" });
                    window.location.href = "/auth/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

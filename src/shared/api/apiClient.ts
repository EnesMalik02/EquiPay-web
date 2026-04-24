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
let refreshQueue: Array<(value: unknown) => void> = [];

function drainQueue(error: unknown = null) {
    refreshQueue.forEach((resolve) => resolve(error));
    refreshQueue = [];
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh")
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push((err) => {
                        if (err) return reject(err);
                        resolve(apiClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await apiClient.post("/auth/refresh");
                isRefreshing = false;
                drainQueue();
                return apiClient(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                drainQueue(refreshError);
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

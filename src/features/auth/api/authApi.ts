import { apiClient } from "@/shared/api/apiClient";
import { TokenResponse, User } from "../model/types";

export const authApi = {
    async register(payload: {
        email: string;
        password: string;
        display_name?: string;
        username?: string;
        phone?: string;
    }): Promise<TokenResponse> {
        const { data } = await apiClient.post<TokenResponse>("/auth/register", payload);
        return data;
    },

    async login(email: string, password: string): Promise<TokenResponse> {
        const { data } = await apiClient.post<TokenResponse>("/auth/login", { email, password });
        return data;
    },

    async me(): Promise<User> {
        const { data } = await apiClient.get<User>("/auth/me");
        return data;
    },
};

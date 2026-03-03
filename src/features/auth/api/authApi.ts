import { apiClient } from "@/shared/api/apiClient";
import { TokenResponse, User } from "../model/types";

export const authApi = {
    async register(username: string, phone: string): Promise<TokenResponse> {
        const { data } = await apiClient.post<TokenResponse>("/auth/register", { username, phone });
        return data;
    },

    async login(phone: string): Promise<TokenResponse> {
        const { data } = await apiClient.post<TokenResponse>("/auth/login", { phone });
        return data;
    },

    async me(): Promise<User> {
        const { data } = await apiClient.get<User>("/auth/me");
        return data;
    },
};

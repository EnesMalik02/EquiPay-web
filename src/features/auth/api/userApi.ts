import { apiClient } from "@/shared/api/apiClient";
import { User } from "../model/types";

export interface UpdateProfilePayload {
    email?: string;
    display_name?: string;
    username?: string;
    phone?: string;
}

export const userApi = {
    async updateProfile(payload: UpdateProfilePayload): Promise<User> {
        const { data } = await apiClient.patch<User>("/users/me", payload);
        return data;
    },
};

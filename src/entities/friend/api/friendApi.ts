import { apiClient } from "@/shared/api/apiClient";
import { FriendResponse, FriendRequestResponse } from "../model/types";

export const friendApi = {
    async list(): Promise<FriendResponse[]> {
        const { data } = await apiClient.get<FriendResponse[]>("/friendships");
        return data;
    },

    async listPending(): Promise<FriendRequestResponse[]> {
        const { data } = await apiClient.get<FriendRequestResponse[]>("/friendships/pending");
        return data;
    },

    async send(email: string): Promise<{ id: string; status: string }> {
        const { data } = await apiClient.post<{ id: string; status: string }>("/friendships", { email });
        return data;
    },

    async respond(id: string, action: "accept" | "reject"): Promise<unknown> {
        const { data } = await apiClient.patch(`/friendships/${id}`, { action });
        return data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(`/friendships/${id}`);
    },
};

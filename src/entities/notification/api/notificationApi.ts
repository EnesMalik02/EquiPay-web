import { apiClient } from "@/shared/api/apiClient";
import { NotificationResponse } from "../model/types";

export const notificationApi = {
    async list(): Promise<NotificationResponse[]> {
        const { data } = await apiClient.get<NotificationResponse[]>("/notifications");
        return data;
    },

    async markRead(notificationId: string): Promise<void> {
        await apiClient.patch(`/notifications/${notificationId}/read`);
    },
};

import { apiClient } from "@/shared/api/apiClient";
import { CursorPage, SettlementCreate, SettlementResponse, SettlementUpdateStatus } from "../model/types";

export const settlementApi = {
    async create(payload: SettlementCreate): Promise<SettlementResponse> {
        const { data } = await apiClient.post<SettlementResponse>("/settlements", payload);
        return data;
    },

    async listMine(params?: { cursor?: string; limit?: number }): Promise<CursorPage<SettlementResponse>> {
        const { data } = await apiClient.get<CursorPage<SettlementResponse>>("/settlements/me", { params });
        return data;
    },

    async listByGroup(groupId: string, params?: { cursor?: string; limit?: number }): Promise<CursorPage<SettlementResponse>> {
        const { data } = await apiClient.get<CursorPage<SettlementResponse>>(`/settlements/group/${groupId}`, { params });
        return data;
    },

    async getById(id: string): Promise<SettlementResponse> {
        const { data } = await apiClient.get<SettlementResponse>(`/settlements/${id}`);
        return data;
    },

    async updateStatus(id: string, payload: SettlementUpdateStatus): Promise<SettlementResponse> {
        const { data } = await apiClient.patch<SettlementResponse>(`/settlements/${id}/status`, payload);
        return data;
    },
};

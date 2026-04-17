import { apiClient } from "@/shared/api/apiClient";
import { SettlementCreate, SettlementResponse, SettlementUpdateStatus } from "../model/types";

export const settlementApi = {
    async create(payload: SettlementCreate): Promise<SettlementResponse> {
        const { data } = await apiClient.post<SettlementResponse>("/settlements", payload);
        return data;
    },

    async listMine(): Promise<SettlementResponse[]> {
        const { data } = await apiClient.get<SettlementResponse[]>("/settlements/me");
        return data;
    },

    async listByGroup(groupId: string): Promise<SettlementResponse[]> {
        const { data } = await apiClient.get<SettlementResponse[]>(`/settlements/group/${groupId}`);
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

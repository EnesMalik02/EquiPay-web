import { apiClient } from "@/shared/api/apiClient";
import {
    CursorPage,
    GroupCreate,
    GroupInvitationRespond,
    GroupMemberAdd,
    GroupMemberResponse,
    GroupMemberRoleUpdate,
    GroupResponse,
    GroupUpdate,
    GroupWithStatsResponse,
} from "../model/types";

export const groupApi = {
    async list(params?: { limit?: number; cursor?: string }): Promise<CursorPage<GroupWithStatsResponse>> {
        const { data } = await apiClient.get<CursorPage<GroupWithStatsResponse>>("/groups", { params });
        return data;
    },

    async create(payload: GroupCreate): Promise<GroupResponse> {
        const { data } = await apiClient.post<GroupResponse>("/groups", payload);
        return data;
    },

    async get(groupId: string): Promise<GroupWithStatsResponse> {
        const { data } = await apiClient.get<GroupWithStatsResponse>(`/groups/${groupId}`);
        return data;
    },

    async update(groupId: string, payload: GroupUpdate): Promise<GroupResponse> {
        const { data } = await apiClient.patch<GroupResponse>(`/groups/${groupId}`, payload);
        return data;
    },

    async remove(groupId: string): Promise<void> {
        await apiClient.delete(`/groups/${groupId}`);
    },

    async leave(groupId: string): Promise<void> {
        await apiClient.post(`/groups/${groupId}/leave`);
    },

    async updateMemberRole(groupId: string, userId: string, payload: GroupMemberRoleUpdate): Promise<GroupMemberResponse> {
        const { data } = await apiClient.patch<GroupMemberResponse>(`/groups/${groupId}/members/${userId}/role`, payload);
        return data;
    },

    async addMember(groupId: string, payload: GroupMemberAdd): Promise<GroupMemberResponse> {
        const { data } = await apiClient.post<GroupMemberResponse>(`/groups/${groupId}/members`, payload);
        return data;
    },

    async listMembers(groupId: string): Promise<GroupMemberResponse[]> {
        const { data } = await apiClient.get<GroupMemberResponse[]>(`/groups/${groupId}/members`);
        return data;
    },

    async respondToInvitation(groupId: string, payload: GroupInvitationRespond): Promise<{ detail: string }> {
        const { data } = await apiClient.post<{ detail: string }>(`/groups/${groupId}/invitations/respond`, payload);
        return data;
    },
};

import { apiClient } from "@/shared/api/apiClient";
import {
    GroupCreate,
    GroupMemberAdd,
    GroupMemberResponse,
    GroupMemberRoleUpdate,
    GroupResponse,
    GroupUpdate,
} from "../model/types";

export const groupApi = {
    async list(): Promise<GroupResponse[]> {
        const { data } = await apiClient.get<GroupResponse[]>("/groups");
        return data;
    },

    async create(payload: GroupCreate): Promise<GroupResponse> {
        const { data } = await apiClient.post<GroupResponse>("/groups", payload);
        return data;
    },

    async get(groupId: string): Promise<GroupResponse> {
        const { data } = await apiClient.get<GroupResponse>(`/groups/${groupId}`);
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
};

import { apiClient } from "@/shared/api/apiClient";
import {
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseDetailResponse,
    ExpenseWithMySplitResponse,
    ExpenseSplitResponse,
    ListExpensesParams,
} from "../model/types";

export const expenseApi = {
    async create(payload: ExpenseCreate): Promise<ExpenseResponse> {
        const { data } = await apiClient.post<ExpenseResponse>("/expenses", payload);
        return data;
    },

    async listByGroup(
        groupId: string,
        params?: ListExpensesParams,
    ): Promise<ExpenseResponse[]> {
        const { data } = await apiClient.get<ExpenseResponse[]>(
            `/expenses/group/${groupId}`,
            { params },
        );
        return data;
    },

    async getById(expenseId: string): Promise<ExpenseDetailResponse> {
        const { data } = await apiClient.get<ExpenseDetailResponse>(`/expenses/${expenseId}`);
        return data;
    },

    async getRecent(limit = 10): Promise<ExpenseWithMySplitResponse[]> {
        const { data } = await apiClient.get<ExpenseWithMySplitResponse[]>("/expenses/me/recent", {
            params: { limit },
        });
        return data;
    },

    async getMySplits(params?: { limit?: number; offset?: number }): Promise<ExpenseWithMySplitResponse[]> {
        const { data } = await apiClient.get<ExpenseWithMySplitResponse[]>("/expenses/me/splits", {
            params: { limit: 20, offset: 0, ...params },
        });
        return data;
    },

    async update(expenseId: string, payload: ExpenseUpdate): Promise<ExpenseResponse> {
        const { data } = await apiClient.patch<ExpenseResponse>(`/expenses/${expenseId}`, payload);
        return data;
    },

    async deleteById(expenseId: string): Promise<void> {
        await apiClient.delete(`/expenses/${expenseId}`);
    },

    async paySplit(expenseId: string, splitId: string): Promise<ExpenseSplitResponse> {
        const { data } = await apiClient.patch<ExpenseSplitResponse>(
            `/expenses/${expenseId}/splits/${splitId}/pay`,
        );
        return data;
    },
};

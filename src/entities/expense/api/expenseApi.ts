import { apiClient } from "@/shared/api/apiClient";
import {
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    RecentExpenseResponse,
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

    async getById(expenseId: string): Promise<ExpenseResponse> {
        const { data } = await apiClient.get<ExpenseResponse>(`/expenses/${expenseId}`);
        return data;
    },

    async getRecent(limit = 10): Promise<RecentExpenseResponse[]> {
        const { data } = await apiClient.get<RecentExpenseResponse[]>("/expenses/me/recent", {
            params: { limit },
        });
        return data;
    },

    async getMySplits(limit = 100): Promise<RecentExpenseResponse[]> {
        const { data } = await apiClient.get<RecentExpenseResponse[]>("/expenses/me/splits", {
            params: { limit },
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

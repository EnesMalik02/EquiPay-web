import { apiClient } from "@/shared/api/apiClient";
import {
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseFullDetailResponse,
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

    async getById(expenseId: string): Promise<ExpenseFullDetailResponse> {
        const { data } = await apiClient.get<ExpenseFullDetailResponse>(`/expenses/${expenseId}`);
        return data;
    },

    async getMySplits(params?: { limit?: number; offset?: number; status?: "all" | "paid" | "unpaid"; group_id?: string }): Promise<ExpenseWithMySplitResponse[]> {
        const { data } = await apiClient.get<ExpenseWithMySplitResponse[]>("/expenses/me/splits", {
            params: { limit: 20, offset: 0, status: "all", ...params },
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

    async paySplit(expenseId: string, splitId: string, paidAmount?: number): Promise<ExpenseSplitResponse> {
        const { data } = await apiClient.patch<ExpenseSplitResponse>(
            `/expenses/${expenseId}/splits/${splitId}/pay`,
            paidAmount !== undefined ? { paid_amount: paidAmount } : {},
        );
        return data;
    },
};

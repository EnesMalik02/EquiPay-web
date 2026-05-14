import { apiClient } from "@/shared/api/apiClient";
import {
    CursorPage,
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
    ): Promise<CursorPage<ExpenseWithMySplitResponse>> {
        const { data } = await apiClient.get<CursorPage<ExpenseWithMySplitResponse>>(
            `/expenses/group/${groupId}`,
            { params },
        );
        return data;
    },

    async getById(expenseId: string): Promise<ExpenseFullDetailResponse> {
        const { data } = await apiClient.get<ExpenseFullDetailResponse>(`/expenses/${expenseId}`);
        return data;
    },

    async getMySplits(params?: { limit?: number; cursor?: string; status?: "all" | "paid" | "unpaid"; group_id?: string }): Promise<CursorPage<ExpenseWithMySplitResponse>> {
        const { data } = await apiClient.get<CursorPage<ExpenseWithMySplitResponse>>("/expenses/me/splits", {
            params: { limit: 20, status: "all", ...params },
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

    async uploadTempReceipt(file: File): Promise<{ receipt_url: string; receipt_key: string }> {
        const form = new FormData();
        form.append("file", file);
        const { data } = await apiClient.post<{ receipt_url: string; receipt_key: string }>(
            "/expenses/receipt/upload-temp",
            form,
            { headers: { "Content-Type": "multipart/form-data" } },
        );
        return data;
    },

    async uploadReceipt(expenseId: string, file: File): Promise<{ receipt_url: string }> {
        const form = new FormData();
        form.append("file", file);
        const { data } = await apiClient.put<{ receipt_url: string }>(
            `/expenses/${expenseId}/receipt`,
            form,
            { headers: { "Content-Type": "multipart/form-data" } },
        );
        return data;
    },

    async deleteReceipt(expenseId: string): Promise<void> {
        await apiClient.delete(`/expenses/${expenseId}/receipt`);
    },
};

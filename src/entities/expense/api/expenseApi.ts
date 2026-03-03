import { apiClient } from "@/shared/api/apiClient";
import { ExpenseCreate, ExpenseResponse, ExpenseSplitResponse, ListExpensesParams } from "../model/types";

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

    async paySplit(expenseId: string, splitId: string): Promise<ExpenseSplitResponse> {
        const { data } = await apiClient.patch<ExpenseSplitResponse>(
            `/expenses/${expenseId}/splits/${splitId}/pay`,
        );
        return data;
    },
};

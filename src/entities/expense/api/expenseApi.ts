import { apiClient } from "@/shared/api/apiClient";
import { ExpenseCreate, ExpenseResponse, ListExpensesParams } from "../model/types";

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
};

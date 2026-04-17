export interface ExpenseSplitCreate {
    user_id: string;
    owed_amount: number;
}

export interface ExpenseCreate {
    group_id: string;
    paid_by: string;
    title: string;
    amount: number;
    currency?: string;
    notes?: string;
    expense_date?: string; // YYYY-MM-DD
    split_type?: "equal" | "exact" | "percentage";
    splits: ExpenseSplitCreate[];
}

export interface ExpenseSplitResponse {
    id: string;
    expense_id: string;
    user_id: string;
    owed_amount: string;
    paid_amount: string;
    created_at: string;
}

export interface ExpenseResponse {
    id: string;
    group_id: string;
    paid_by: string;
    title: string;
    amount: string;
    currency: string;
    notes?: string;
    expense_date: string;
    split_type: string;
    created_at: string;
    updated_at: string;
    is_fully_paid: boolean;
    splits: ExpenseSplitResponse[];
}

export interface ExpenseUpdate {
    title?: string;
    amount?: number;
    currency?: string;
    notes?: string;
    expense_date?: string;
}

export interface RecentExpenseResponse extends ExpenseResponse {
    group_name: string | null;
}

export interface ListExpensesParams {
    limit?: number;
    offset?: number;
}

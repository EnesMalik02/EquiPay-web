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
    splits: ExpenseSplitCreate[];
}

export interface ExpenseSplitResponse {
    id: string;
    expense_id: string;
    user_id: string;
    /** Decimal string from API e.g. "75.00" */
    owed_amount: string;
    /** Decimal string from API e.g. "0.00" */
    paid_amount: string;
    created_at: string;
}

export interface ExpenseResponse {
    id: string;
    group_id: string;
    paid_by: string;
    title: string;
    /** Decimal string from API e.g. "150.00" */
    amount: string;
    currency: string;
    notes?: string;
    expense_date: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    is_fully_paid: boolean;
    splits?: ExpenseSplitResponse[];
}

export interface ListExpensesParams {
    limit?: number;  // 1–100, default 20
    offset?: number; // default 0
}

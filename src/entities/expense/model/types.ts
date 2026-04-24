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

export interface ExpenseUpdate {
    title?: string;
    amount?: number;
    currency?: string;
    notes?: string;
    expense_date?: string;
}

/** Expense detail sayfasında tüm split'ler için kullanılır. */
export interface ExpenseSplitResponse {
    id: string;
    expense_id: string;
    user_id: string;
    owed_amount: string;
    paid_amount: string;
}

/** Kullanıcının kendi payı özeti — liste görünümleri için. */
export interface MySplitSummary {
    id: string;
    owed_amount: string;
    paid_amount: string;
}

/** Temel expense bilgisi — grup expense listesi için. */
export interface ExpenseResponse {
    id: string;
    group_id: string | null;
    paid_by: string;
    title: string;
    amount: string;
    currency: string;
    notes?: string | null;
    expense_date: string;
    split_type: string;
    created_at: string;
    is_fully_paid: boolean;
    splits: ExpenseSplitResponse[];
}

/** Expense detayı — tüm split'lerle birlikte (detail sayfası). */
export interface ExpenseDetailResponse extends ExpenseResponse {
    splits: ExpenseSplitResponse[];
}

/** Kullanıcının split'i olan harcama özeti — home ve settlements için. */
export interface ExpenseWithMySplitResponse {
    id: string;
    group_id: string | null;
    group_name: string | null;
    paid_by: string;
    title: string;
    amount: string;
    currency: string;
    notes?: string | null;
    expense_date: string;
    created_at: string | null;
    is_fully_paid: boolean;
    my_split: MySplitSummary | null;
}

export interface ListExpensesParams {
    limit?: number;
    offset?: number;
}

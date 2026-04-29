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
    expense_date?: string;
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

export interface ExpenseSplitResponse {
    id: string;
    expense_id: string;
    user_id: string;
    owed_amount: string;
    paid_amount: string;
}

/** Temel expense bilgisi — grup expense listesi için (listByGroup). */
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

// ── ExpenseWithMySplitResponse (GET /expenses/me/splits) ──

export interface GroupBrief {
    group_id: string;
    name: string;
}

export interface PaidByBrief {
    name: string;
}

export interface UserAmount {
    direction: "debit" | "credit";
    amount: string;
    currency: string;
}

/** Kullanıcının split'i olan harcama özeti — home ve settlements için. */
export interface ExpenseWithMySplitResponse {
    id: string;
    title: string;
    amount: string;
    currency: string;
    expense_date: string | null;
    is_fully_paid: boolean;
    split_id: string | null;
    group: GroupBrief | null;
    paid_by: PaidByBrief;
    created_at: string | null;
    updated_at?: string | null;
    user_amount: UserAmount;
}

// ── ExpenseFullDetailResponse (GET /expenses/{id}) ──

export interface GroupDetail {
    id: string;
    name: string;
}

export interface PaidByDetail {
    id: string;
    name: string;
}

export interface SplitUserBrief {
    id: string;
    name: string;
    avatar_url?: string | null;
}

export interface SplitDetailItem {
    id: string;
    user: SplitUserBrief;
    owed_amount: string;
    paid_amount: string;
    remaining_amount: string;
    status: "paid" | "pending";
}

export interface ExpenseFullDetailResponse {
    id: string;
    group: GroupDetail | null;
    paid_by: PaidByDetail;
    title: string;
    amount: string;
    currency: string;
    notes?: string | null;
    expense_date: string | null;
    split_type: string;
    created_at: string | null;
    splits: SplitDetailItem[];
}

export interface ListExpensesParams {
    limit?: number;
    offset?: number;
}

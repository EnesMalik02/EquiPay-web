export interface CursorPage<T> {
    items: T[];
    next_cursor: string | null;
    has_more: boolean;
}

export interface GroupResponse {
    id: string;
    name: string;
    description?: string;
    currency_code: string;
    created_at: string;
    updated_at?: string;
    member_count?: number;
}

export interface GroupWithStatsResponse extends GroupResponse {
    member_count: number;
    balance_formatted: string;
    balance_direction: "receivable" | "debt" | "settled";
}

export interface GroupCreate {
    name: string;
    description?: string;
    currency_code: string;
}

export interface GroupUpdate {
    name?: string;
    description?: string;
}

export interface GroupMemberAdd {
    email?: string;
    username?: string;
}

export interface GroupMemberRoleUpdate {
    role: "admin" | "member";
}

export interface GroupMemberResponse {
    user_id: string;
    display_name?: string;
    username?: string;
    role?: "admin" | "member";
    status?: "active" | "pending";
}

export interface GroupInvitationRespond {
    action: "accept" | "decline";
}

export interface GroupStatsMember {
    user_id: string;
    name: string;
    avatar_url: string | null;
    total_paid: string;
    total_owed: string;
    net_balance: string;
    outstanding_debt?: string;
    outstanding_receivable?: string;
}

export interface GroupStatsCategory {
    category: string | null;
    total: string;
    count: number;
}

export interface GroupStatsMonthlyTrend {
    year_month: string;
    total: string;
    count: number;
}

export interface GroupStatsResponse {
    total_amount: string;
    total_expense_count: number;
    currency: string;
    member_stats: GroupStatsMember[];
    category_breakdown: GroupStatsCategory[];
    monthly_trend?: GroupStatsMonthlyTrend[];
}

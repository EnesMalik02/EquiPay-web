export type SettlementStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export interface CursorPage<T> {
    items: T[];
    next_cursor: string | null;
    has_more: boolean;
}

export interface SettlementCreate {
    group_id?: string;
    receiver_id: string;
    amount: number;
    currency?: string;
    note?: string;
}

export interface SettlementUpdateStatus {
    status: SettlementStatus;
}

export interface SettlementResponse {
    id: string;
    group_id?: string;
    payer_id: string;
    receiver_id: string;
    amount: string;
    currency: string;
    status: SettlementStatus;
    settled_at?: string | null;
    note?: string | null;
    created_at: string;
}

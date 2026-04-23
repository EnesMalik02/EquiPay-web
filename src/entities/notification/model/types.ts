export interface NotificationResponse {
    id: string;
    type: string;
    data: unknown;
    is_read: boolean;
    created_at: string;
}

export interface GroupInvitationData {
    group_id: string;
    group_name: string;
    invited_by_id: string;
    invited_by_name: string;
}

export interface GroupResponse {
    id: string;
    name: string;
    description?: string;
    currency?: string;
    created_at: string;
    updated_at?: string;
    member_count?: number;
}

export interface GroupCreate {
    name: string;
    description?: string;
    currency?: string;
}

export interface GroupUpdate {
    name?: string;
    description?: string;
    currency?: string;
}

export interface GroupMemberAdd {
    user_id: string;
}

export interface GroupMemberResponse {
    id: string;
    group_id: string;
    user_id: string;
    name: string;
    phone?: string;
    joined_at: string;
}

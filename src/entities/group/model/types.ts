export interface GroupResponse {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at?: string;
    member_count?: number;
}

export interface GroupCreate {
    name: string;
    description?: string;
}

export interface GroupUpdate {
    name?: string;
    description?: string;
}

export interface GroupMemberAdd {
    phone?: string;
    email?: string;
}

export interface GroupMemberRoleUpdate {
    role: "admin" | "member";
}

export interface GroupMemberResponse {
    id: string;
    group_id: string;
    user_id: string;
    display_name?: string;
    username?: string;
    role?: "admin" | "member";
    joined_at: string;
    left_at?: string | null;
}

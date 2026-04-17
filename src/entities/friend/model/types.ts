export interface FriendUserInfo {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
    username?: string;
}

export interface FriendResponse {
    friendship_id: string;
    user: FriendUserInfo;
    created_at?: string;
}

export interface FriendRequestResponse {
    id: string;
    requester: FriendUserInfo;
    created_at?: string;
}

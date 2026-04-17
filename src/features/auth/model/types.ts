export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface User {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
    username?: string;
    phone?: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface User {
    id?: string | number;
    name: string;
    phone: string;
}

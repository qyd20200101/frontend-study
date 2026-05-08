export interface SystemUser {
    id?: number;
    username: string;
    password?: string;
    role: 'admin' | 'editor' | 'viewer';
    roles: string[];
    status: 'active' | 'disabled';
    lastLogin?: string;
}

export interface UserQuery {
    keyword?: string;
    role?: string;
}
export interface LoginParams {
    username: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
    user: SystemUser;
}

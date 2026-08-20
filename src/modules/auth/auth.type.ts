export interface Staff {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface AuthJwtPayload {
    staffId: number;
    email: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    staff: Omit<Staff, "password_hash">;
}
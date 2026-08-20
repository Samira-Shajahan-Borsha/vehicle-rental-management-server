export interface Vehicle {
    id: number;
    name: string;
    plate_number: string;
    category: string;
    daily_rate: string;
    photo_path: string | null;
    deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateVehicleRequestBody {
    name: string;
    plate_number: string;
    category: string;
    daily_rate: number;
}

export interface CreateVehiclePayload {
    name: string;
    plate_number: string;
    category: string;
    daily_rate: number;
    photo_path?: string | null;
}

export interface UpdateVehicleRequestBody {
    name?: string;
    plate_number?: string;
    category?: string;
    daily_rate?: number;
}

export interface UpdateVehiclePayload {
    name?: string;
    plate_number?: string;
    category?: string;
    daily_rate?: number;
    photo_path?: string | null;
}

export interface VehicleListQuery {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
}

export interface VehicleListResult {
    vehicles: Vehicle[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPage: number;
    };
}

export type CreateVehicleResponse = Vehicle;
export type GetVehicleResponse = Vehicle;
export type UpdateVehicleResponse = Vehicle;
export type DeleteVehicleResponse = Vehicle;
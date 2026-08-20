export const RENTAL_STATUS = ["booked", "ongoing", "completed", "cancelled"] as const;

export type RentalStatus = (typeof RENTAL_STATUS)[number];

export interface Rental {
    id: number;
    vehicle_id: number;
    customer_name: string;
    customer_phone: string;
    start_date: string;
    end_date: string;
    total_amount: string;
    status: RentalStatus;
    created_at: Date;
    updated_at: Date;
}

export interface CreateRentalRequestBody {
    vehicle_id: number;
    customer_name: string;
    customer_phone: string;
    start_date: string;
    end_date: string;
}

export interface CreateRentalPayload {
    vehicle_id: number;
    customer_name: string;
    customer_phone: string;
    start_date: string;
    end_date: string;
}

export interface UpdateRentalRequestBody {
    vehicle_id?: number;
    customer_name?: string;
    customer_phone?: string;
    start_date?: string;
    end_date?: string;
    status?: RentalStatus;
}

export interface UpdateRentalPayload {
    vehicle_id?: number;
    customer_name?: string;
    customer_phone?: string;
    start_date?: string;
    end_date?: string;
    status?: RentalStatus;
}

export interface RentalListQuery {
    page?: number;
    limit?: number;
    vehicle_id?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export interface RentalListResult {
    rentals: Rental[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPage: number;
    };
}

export type CreateRentalResponse = Rental;
export type GetRentalResponse = Rental;
export type UpdateRentalResponse = Rental;
export type DeleteRentalResponse = Rental;
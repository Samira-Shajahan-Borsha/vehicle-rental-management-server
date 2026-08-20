import { StatusCodes } from "http-status-codes";
import { database } from "../../config/knex.ts";
import AppError from "../../errorHelper/AppError.ts";
import { QueryBuilder } from "../../utils/queryBuilder.ts";
import { Vehicle } from "../vehicle/vehicle.type.ts";
import {
    CreateRentalPayload,
    CreateRentalResponse,
    DeleteRentalResponse,
    GetRentalResponse,
    Rental,
    RentalListQuery,
    RentalListResult,
    UpdateRentalPayload,
    UpdateRentalResponse,
} from "./rental.type.ts";

const ACTIVE_STATUSES = ["booked", "ongoing"];

const PER_DAY = 24 * 60 * 60 * 1000;

const toDateString = (value: string | Date): string => {
    if (typeof value === "string") {
        return value.slice(0, 10);
    }

    return value.toISOString().slice(0, 10);
};

const calculateTotalAmount = (dailyRate: string, startDate: Date, endDate: Date): string => {
    const days = Math.round((endDate.getTime() - startDate.getTime()) / PER_DAY) + 1;

    return (Number(dailyRate) * days).toFixed(2);
};

export class RentalService {
    private readonly rentalTable = "rentals";
    private readonly vehicleTable = "vehicles";

    public async createRental(payload: CreateRentalPayload): Promise<CreateRentalResponse> {
        const vehicle = await database<Vehicle>(this.vehicleTable)
            .where("id", payload.vehicle_id)
            .whereNull("deleted_at")
            .first();

        if (!vehicle) {
            throw new AppError(StatusCodes.NOT_FOUND, "Vehicle not found.");
        }

        const startDate = toDateString(payload.start_date);
        const endDate = toDateString(payload.end_date);

        await this.checkVehicleAvailability(payload.vehicle_id, startDate, endDate);

        const totalAmount = calculateTotalAmount(
            vehicle.daily_rate,
            new Date(startDate),
            new Date(endDate)
        );

        const [rental] = await database<Rental>(this.rentalTable)
            .insert({
                vehicle_id: payload.vehicle_id,
                customer_name: payload.customer_name,
                customer_phone: payload.customer_phone,
                start_date: startDate,
                end_date: endDate,
                total_amount: totalAmount,
            })
            .returning("*");

        return rental;
    }

    public async getAllRentals(query: RentalListQuery): Promise<RentalListResult> {
        const baseQuery = database<Rental>(this.rentalTable).orderBy("id", "desc");

        if (query.startDate) {
            baseQuery.where("start_date", ">=", query.startDate);
        }

        if (query.endDate) {
            baseQuery.where("end_date", "<=", query.endDate);
        }

        const queryBuilder = new QueryBuilder<Rental>(baseQuery, { ...query });

        const [rentals, meta] = await Promise.all([
            queryBuilder
                .filter(["search", "page", "limit", "startDate", "endDate"])
                .paginate()
                .build(),
            queryBuilder.getMeta(),
        ]);

        return {
            rentals,
            meta,
        };
    }

    public async getRentalById(id: number): Promise<GetRentalResponse> {
        const rental = await database<Rental>(this.rentalTable).where("id", id).first();

        if (!rental) {
            throw new AppError(StatusCodes.NOT_FOUND, "Rental not found.");
        }

        return rental;
    }

    public async updateRental(
        id: number,
        payload: UpdateRentalPayload
    ): Promise<UpdateRentalResponse> {
        const rental = await database<Rental>(this.rentalTable).where("id", id).first();

        if (!rental) {
            throw new AppError(StatusCodes.NOT_FOUND, "Rental not found.");
        }

        const currentStartDate = toDateString(rental.start_date);
        const currentEndDate = toDateString(rental.end_date);

        const vehicleId = payload.vehicle_id ?? rental.vehicle_id;
        const startDate = payload.start_date ? toDateString(payload.start_date) : currentStartDate;
        const endDate = payload.end_date ? toDateString(payload.end_date) : currentEndDate;

        const datesChanged = startDate !== currentStartDate || endDate !== currentEndDate;
        const vehicleChanged = vehicleId !== rental.vehicle_id;

        if (datesChanged || vehicleChanged) {
            await this.checkVehicleAvailability(vehicleId, startDate, endDate, id);
        }

        const changes: Partial<Rental> = {};

        if (payload.customer_name !== undefined) {
            changes.customer_name = payload.customer_name;
        }

        if (payload.customer_phone !== undefined) {
            changes.customer_phone = payload.customer_phone;
        }

        if (payload.status !== undefined) {
            changes.status = payload.status;
        }

        if (vehicleChanged) {
            changes.vehicle_id = vehicleId;
        }

        if (datesChanged) {
            changes.start_date = startDate;
            changes.end_date = endDate;
        }

        if (datesChanged || vehicleChanged) {
            const vehicle = await database<Vehicle>(this.vehicleTable)
                .where("id", vehicleId)
                .whereNull("deleted_at")
                .first();

            if (!vehicle) {
                throw new AppError(StatusCodes.NOT_FOUND, "Vehicle not found.");
            }

            changes.total_amount = calculateTotalAmount(
                vehicle.daily_rate,
                new Date(startDate),
                new Date(endDate)
            );
        }

        if (Object.keys(changes).length === 0) {
            return rental;
        }

        const [updated] = await database<Rental>(this.rentalTable)
            .where("id", id)
            .update(changes)
            .returning("*");

        return updated;
    }

    public async deleteRental(id: number): Promise<DeleteRentalResponse> {
        const rental = await database<Rental>(this.rentalTable).where("id", id).first();

        if (!rental) {
            throw new AppError(StatusCodes.NOT_FOUND, "Rental not found.");
        }

        const [deleted] = await database<Rental>(this.rentalTable)
            .where("id", id)
            .del()
            .returning("*");

        return deleted;
    }

    private async checkVehicleAvailability(
        vehicleId: number,
        startDate: string,
        endDate: string,
        excludeRentalId?: number
    ): Promise<void> {
        let query = database<Rental>(this.rentalTable)
            .where("vehicle_id", vehicleId)
            .whereIn("status", ACTIVE_STATUSES)
            .where("start_date", "<=", endDate)
            .where("end_date", ">=", startDate);

        if (excludeRentalId !== undefined) {
            query = query.whereNot("id", excludeRentalId);
        }

        const conflicting = await query.first();

        if (conflicting) {
            throw new AppError(
                StatusCodes.CONFLICT,
                `Vehicle is already rented from ${toDateString(conflicting.start_date)} to ${toDateString(conflicting.end_date)} for the requested dates.`
            );
        }
    }
}

export const rentalService = new RentalService();
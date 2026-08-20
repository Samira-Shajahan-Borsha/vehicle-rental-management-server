import { StatusCodes } from "http-status-codes";
import { database } from "../../config/knex.ts";
import AppError from "../../errorHelper/AppError.ts";
import { deleteImageFromCloudinary } from "../../config/cloudinary.ts";
import {
    CreateVehiclePayload,
    CreateVehicleResponse,
    DeleteVehicleResponse,
    GetVehicleResponse,
    UpdateVehiclePayload,
    UpdateVehicleResponse,
    Vehicle,
} from "./vehicle.type.ts";

export class VehicleService {
    private readonly vehicleTable = "vehicles";

    public async createVehicle(payload: CreateVehiclePayload): Promise<CreateVehicleResponse> {
        const existing = await database<Vehicle>(this.vehicleTable)
            .where("plate_number", payload.plate_number)
            .first();

        if (existing) {
            throw new AppError(
                StatusCodes.CONFLICT,
                `A vehicle with plate number "${payload.plate_number}" already exists.`
            );
        }

        const [vehicle] = await database<Vehicle>(this.vehicleTable)
            .insert({
                name: payload.name,
                plate_number: payload.plate_number,
                category: payload.category,
                daily_rate: String(payload.daily_rate),
                photo_path: payload.photo_path ?? null,
            })
            .returning("*");

        return vehicle;
    }

    public async getVehicleById(id: number): Promise<GetVehicleResponse> {
        const vehicle = await database<Vehicle>(this.vehicleTable)
            .where("id", id)
            .whereNull("deleted_at")
            .first();

        if (!vehicle) {
            throw new AppError(StatusCodes.NOT_FOUND, "Vehicle not found.");
        }

        return vehicle;
    }

    public async updateVehicle(
        id: number,
        payload: UpdateVehiclePayload,
        newPhotoPath?: string | null
    ): Promise<UpdateVehicleResponse> {
        const vehicle = await database<Vehicle>(this.vehicleTable)
            .where("id", id)
            .whereNull("deleted_at")
            .first();

        if (!vehicle) {
            throw new AppError(StatusCodes.NOT_FOUND, "Vehicle not found.");
        }

        if (payload.plate_number && payload.plate_number !== vehicle.plate_number) {
            const existing = await database<Vehicle>(this.vehicleTable)
                .where("plate_number", payload.plate_number)
                .whereNot("id", id)
                .first();

            if (existing) {
                throw new AppError(
                    StatusCodes.CONFLICT,
                    `A vehicle with plate number "${payload.plate_number}" already exists.`
                );
            }
        }

        const changes: Partial<Vehicle> = {};

        if (payload.name !== undefined) {
            changes.name = payload.name;
        }

        if (payload.plate_number !== undefined) {
            changes.plate_number = payload.plate_number;
        }

        if (payload.category !== undefined) {
            changes.category = payload.category;
        }

        if (payload.daily_rate !== undefined) {
            changes.daily_rate = String(payload.daily_rate);
        }

        if (newPhotoPath) {
            if (vehicle.photo_path) {
                await deleteImageFromCloudinary(vehicle.photo_path);
            }
            changes.photo_path = newPhotoPath;
        }

        if (Object.keys(changes).length === 0) {
            return vehicle;
        }

        const [updated] = await database<Vehicle>(this.vehicleTable)
            .where("id", id)
            .update(changes)
            .returning("*");

        return updated;
    }

    public async softDeleteVehicle(id: number): Promise<DeleteVehicleResponse> {
        const vehicle = await database<Vehicle>(this.vehicleTable)
            .where("id", id)
            .whereNull("deleted_at")
            .first();

        if (!vehicle) {
            throw new AppError(StatusCodes.NOT_FOUND, "Vehicle not found.");
        }

        const [deleted] = await database<Vehicle>(this.vehicleTable)
            .where("id", id)
            .update({ deleted_at: new Date() })
            .returning("*");

        return deleted;
    }
}

export const vehicleService = new VehicleService();
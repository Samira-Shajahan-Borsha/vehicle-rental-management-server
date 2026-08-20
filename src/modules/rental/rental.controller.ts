import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import { rentalService } from "./rental.service.ts";
import {
    CreateRentalRequestBody,
    CreateRentalResponse,
    DeleteRentalResponse,
    GetRentalResponse,
    UpdateRentalRequestBody,
    UpdateRentalResponse,
} from "./rental.type.ts";

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit =
        Number(req.query.limit) > 0 ? Math.min(Number(req.query.limit), 100) : 10;
    const vehicleId = Number(req.query.vehicle_id) > 0 ? Number(req.query.vehicle_id) : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const startDate = typeof req.query.startDate === "string" ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === "string" ? req.query.endDate : undefined;

    const result = await rentalService.getAllRentals({
        page,
        limit,
        vehicle_id: vehicleId,
        status,
        startDate,
        endDate,
    });

    sendResponse<typeof result.rentals>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Rentals retrieved successfully",
        meta: result.meta,
        data: result.rentals,
    });
});

const createRental = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body as CreateRentalRequestBody;

    const result = await rentalService.createRental(payload);

    sendResponse<CreateRentalResponse>(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Rental created successfully",
        data: result,
    });
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const rentalId = Number(id);

    const result = await rentalService.getRentalById(rentalId);

    sendResponse<GetRentalResponse>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Rental retrieved successfully",
        data: result,
    });
});

const updateRental = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const rentalId = Number(id);
    const payload = req.body as UpdateRentalRequestBody;

    const result = await rentalService.updateRental(rentalId, payload);

    sendResponse<UpdateRentalResponse>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Rental updated successfully",
        data: result,
    });
});

const deleteRental = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const rentalId = Number(id);

    const result = await rentalService.deleteRental(rentalId);

    sendResponse<DeleteRentalResponse>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Rental deleted successfully",
        data: result,
    });
});

export const RentalController = {
    getAllRentals,
    createRental,
    getRentalById,
    updateRental,
    deleteRental,
};
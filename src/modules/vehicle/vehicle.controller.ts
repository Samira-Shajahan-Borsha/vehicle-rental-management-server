import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import { vehicleService } from "./vehicle.service.ts";
import {
    CreateVehicleRequestBody,
    CreateVehicleResponse,
    DeleteVehicleResponse,
    GetVehicleResponse,
    UpdateVehicleRequestBody,
    UpdateVehicleResponse,
} from "./vehicle.type.ts";

const createVehicle = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body as CreateVehicleRequestBody;

    const photoPath = req.file?.path ?? null;

    const result = await vehicleService.createVehicle({
        ...payload,
        photo_path: photoPath,
    });

    sendResponse<CreateVehicleResponse>(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Vehicle created successfully",
        data: result,
    });
});

const getVehicleById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const vehicleId = Number(id);

    const result = await vehicleService.getVehicleById(vehicleId);

    sendResponse<GetVehicleResponse>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Vehicle retrieved successfully",
        data: result,
    });
});

const updateVehicle = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const vehicleId = Number(id);
    const payload = req.body as UpdateVehicleRequestBody;

    const newPhotoPath = req.file?.path ?? null;

    const result = await vehicleService.updateVehicle(vehicleId, payload, newPhotoPath);

    sendResponse<UpdateVehicleResponse>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Vehicle updated successfully",
        data: result,
    });
});

const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const vehicleId = Number(id);

    const result = await vehicleService.softDeleteVehicle(vehicleId);

    sendResponse<DeleteVehicleResponse>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Vehicle deleted successfully",
        data: result,
    });
});

export const VehicleController = {
    createVehicle,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
};
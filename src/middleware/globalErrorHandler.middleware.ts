import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../errorHelper/AppError.ts";

export const globalErrorHandler = (
    err: AppError | Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            statusCode: err.statusCode,
            success: false,
            message: err.message,
        });
        return;
    }

    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Internal server error",
    });
};
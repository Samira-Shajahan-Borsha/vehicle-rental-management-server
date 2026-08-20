import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const notFound = (req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};
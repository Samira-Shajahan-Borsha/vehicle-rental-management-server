import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ObjectSchema } from "joi";
import AppError from "../errorHelper/AppError.ts";

export const validateRequest =
    <T>(schema: ObjectSchema<T>, onError?: (req: Request) => Promise<void> | void) =>
    async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (req.body?.data) {
                req.body = JSON.parse(req.body.data);
            }

            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });

            if (error) {
                const messages = error.details.map((detail) => detail.message).join(", ");
                await onError?.(req);
                next(new AppError(StatusCodes.BAD_REQUEST, messages));
                return;
            }

            req.body = value;
            next();
        } catch {
            await onError?.(req);
            next(new AppError(StatusCodes.BAD_REQUEST, "data must be a valid JSON string."));
        }
    };

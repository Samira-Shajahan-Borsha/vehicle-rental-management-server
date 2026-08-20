import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ObjectSchema } from "joi";
import AppError from "../errorHelper/AppError.ts";

export const validateBody =
    <T>(schema: ObjectSchema<T>) =>
    (req: Request, _res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const messages = error.details.map((detail) => detail.message).join(", ");
            next(new AppError(StatusCodes.BAD_REQUEST, messages));
            return;
        }

        req.body = value;
        next();
    };
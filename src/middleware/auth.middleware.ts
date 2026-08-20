import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError.ts";
import { StatusCodes } from "http-status-codes";
import { database } from "../config/knex.ts";
import { verifyToken } from "../utils/jwt.ts";
import { AuthJwtPayload, Staff } from "../modules/auth/auth.type.ts";
import { envVars } from "../config/env.ts";

export const checkAuth = async (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "No token received");
    }

    let verifiedToken: AuthJwtPayload;

    try {
        verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_TOKEN_SECRET) as AuthJwtPayload;
    } catch {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired token");
    }

    const isStaffExist = await database<Staff>("staff").where("id", verifiedToken.staffId).first();

    if (!isStaffExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "Staff does not exist");
    }

    req.user = verifiedToken;

    next();
};
import { Response } from "express";
import { envVars } from "../config/env.ts";

interface IAuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: IAuthTokens) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production" ? true : false,
            sameSite: "none",
            maxAge: 1000 * 60 * 60,
        });
    }

    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production" ? true : false,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 90,
        });
    }
};
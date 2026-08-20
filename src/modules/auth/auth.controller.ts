import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import { setAuthCookie } from "../../utils/setCookie.ts";
import { authService } from "./auth.service.ts";
import { LoginRequestBody, LoginResponse } from "./auth.type.ts";

const login = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body as LoginRequestBody;

    const result = await authService.login(payload);

    setAuthCookie(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });

    sendResponse<LoginResponse>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User logged in successfully",
        data: result,
    });
});

export const AuthController = {
    login,
};
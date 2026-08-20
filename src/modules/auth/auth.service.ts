import { StatusCodes } from "http-status-codes";
import { database } from "../../config/knex.ts";
import AppError from "../../errorHelper/AppError.ts";
import { createTokens } from "../../utils/tokens.ts";
import { comparePassword } from "../../utils/password.ts";
import { LoginResponse, LoginRequestBody, Staff } from "./auth.type.ts";

export class AuthService {
    private readonly staffTable = "staff";

    public async login(payload: LoginRequestBody): Promise<LoginResponse> {
        const staff = await database<Staff>(this.staffTable)
            .where("email", payload.email)
            .first();

        if (!staff) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
        }

        const isPasswordValid = await comparePassword(payload.password, staff.password_hash);

        if (!isPasswordValid) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
        }

        const { accessToken, refreshToken } = createTokens({
            staffId: staff.id,
            email: staff.email,
        });

        const { password_hash: _passwordHash, ...rest } = staff;

        return {
            accessToken,
            refreshToken,
            staff: rest,
        };
    }
}

export const authService = new AuthService();
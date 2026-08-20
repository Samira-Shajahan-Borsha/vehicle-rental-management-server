import { envVars } from "../config/env.ts";
import { AuthJwtPayload } from "../modules/auth/auth.type.ts";
import { generateToken } from "./jwt.ts";

export const createTokens = (staff: Pick<AuthJwtPayload, "staffId" | "email">) => {
    const jwtPayload = {
        staffId: staff.staffId,
        email: staff.email,
    };

    const accessToken = generateToken(
        jwtPayload,
        envVars.JWT_ACCESS_TOKEN_SECRET,
        envVars.JWT_ACCESS_TOKEN_EXPIRES_IN,
    );

    const refreshToken = generateToken(
        jwtPayload,
        envVars.JWT_REFRESH_TOKEN_SECRET,
        envVars.JWT_REFRESH_TOKEN_EXPIRES_IN,
    );

    return {
        accessToken,
        refreshToken,
    };
};

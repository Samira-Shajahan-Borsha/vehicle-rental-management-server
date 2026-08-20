import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
    PORT: string;
    DB_URL: string;
    NODE_ENV: "development" | "production";
    BCRYPT_SALT_ROUND: string;
    JWT_ACCESS_TOKEN_SECRET: string;
    JWT_ACCESS_TOKEN_EXPIRES_IN: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_EXPIRES_IN: string;
    STAFF_EMAIL: string;
    STAFF_PASSWORD: string;
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables: string[] = [
        "PORT",
        "DB_URL",
        "NODE_ENV",
        "BCRYPT_SALT_ROUND",
        "JWT_ACCESS_TOKEN_SECRET",
        "JWT_ACCESS_TOKEN_EXPIRES_IN",
        "JWT_REFRESH_TOKEN_SECRET",
        "JWT_REFRESH_TOKEN_EXPIRES_IN",
        "STAFF_EMAIL",
        "STAFF_PASSWORD",
    ];

    requiredEnvVariables.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing require env variable ${key}`);
        }
    });

    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
        JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string,
        JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as string,
        JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
        JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string,
        STAFF_EMAIL: process.env.STAFF_EMAIL as string,
        STAFF_PASSWORD: process.env.STAFF_PASSWORD as string,
    };
};

export const envVars = loadEnvVariables();
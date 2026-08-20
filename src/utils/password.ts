import bcrypt from "bcryptjs";
import { envVars } from "../config/env.ts";

const SALT_ROUNDS = Number(envVars.BCRYPT_SALT_ROUND);

export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, SALT_ROUNDS);

export const hashPasswordSync = (password: string): string => bcrypt.hashSync(password, SALT_ROUNDS);

export const comparePassword = (password: string, passwordHash: string): Promise<boolean> =>
    bcrypt.compare(password, passwordHash);
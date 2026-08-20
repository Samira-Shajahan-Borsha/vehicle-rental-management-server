import type { Knex } from "knex";
import { envVars } from "../../config/env.ts";
import { hashPassword } from "../../utils/password.ts";

export async function seed(knex: Knex): Promise<void> {
    const passwordHash = await hashPassword(envVars.STAFF_PASSWORD);

    await knex("staff").del();
    await knex("staff").insert({
        email: envVars.STAFF_EMAIL,
        password_hash: passwordHash,
        name: "Admin",
    });
}
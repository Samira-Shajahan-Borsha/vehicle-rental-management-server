import knex, { type Knex } from "knex";
import { types as pgTypes } from "pg";
import { envVars } from "./env.ts";

pgTypes.setTypeParser(1082, (value: string) => value);

export function buildKnexConfig(): Knex.Config {
    return {
        client: "pg",
        connection: {
            connectionString: envVars.DB_URL,
            ssl: { rejectUnauthorized: false },
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
            directory: "src/database/migrations",
        },
        seeds: {
            directory: "src/database/seeds",
        },
    };
}

export const database = knex(buildKnexConfig());
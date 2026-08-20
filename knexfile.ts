import { buildKnexConfig } from "./src/config/knex.ts";

const environments: string[] = ["development", "staging", "production"];

export default Object.fromEntries(environments.map((env: string) => [env, buildKnexConfig()]));
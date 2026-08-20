import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("staff", (table) => {
        table.increments("id").primary();
        table.string("email", 255).notNullable().unique();
        table.string("password_hash", 255).notNullable();
        table.string("name", 255).notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable("vehicles", (table) => {
        table.increments("id").primary();
        table.string("name", 255).notNullable();
        table.string("plate_number", 50).notNullable().unique();
        table.string("category", 100).notNullable();
        table.decimal("daily_rate", 10, 2).notNullable();
        table.string("photo_path", 500).nullable();
        table.timestamp("deleted_at").nullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable("rentals", (table) => {
        table.increments("id").primary();
        table
            .integer("vehicle_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("vehicles");
        table.string("customer_name", 255).notNullable();
        table.string("customer_phone", 50).notNullable();
        table.date("start_date").notNullable();
        table.date("end_date").notNullable();
        table.decimal("total_amount", 12, 2).notNullable();
        table
            .string("status", 20)
            .notNullable()
            .defaultTo("booked")
            .checkIn(["booked", "ongoing", "completed", "cancelled"]);
        table.timestamps(true, true);

        table.index("vehicle_id");
        table.index("status");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("rentals");
    await knex.schema.dropTableIfExists("vehicles");
    await knex.schema.dropTableIfExists("staff");
}

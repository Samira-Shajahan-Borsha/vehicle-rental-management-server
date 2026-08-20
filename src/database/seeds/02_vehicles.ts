import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("vehicles").del();

    await knex("vehicles").insert([
        {
            name: "Toyota Corolla",
            plate_number: "DHA-1234",
            category: "Sedan",
            daily_rate: 3500,
            photo_path: null,
        },
        {
            name: "Honda CBR 150",
            plate_number: "DHA-5678",
            category: "Motorcycle",
            daily_rate: 1200,
            photo_path: null,
        },
    ]);
}
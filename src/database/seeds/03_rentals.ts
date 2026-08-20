import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("rentals").del();

    const vehicles = await knex("vehicles").select("id", "daily_rate").orderBy("id", "asc");

    if (vehicles.length === 0) {
        return;
    }

    const sedan = vehicles[0];
    const motorcycle = vehicles[1] ?? vehicles[0];

    await knex("rentals").insert([
        {
            vehicle_id: sedan.id,
            customer_name: "Alex Morgan",
            customer_phone: "01711-000001",
            start_date: "2026-07-29",
            end_date: "2026-08-03",
            total_amount: (Number(sedan.daily_rate) * 6).toFixed(2),
            status: "booked",
        },
        {
            vehicle_id: sedan.id,
            customer_name: "Jordan Lee",
            customer_phone: "01711-000002",
            start_date: "2026-08-05",
            end_date: "2026-08-05",
            total_amount: Number(sedan.daily_rate).toFixed(2),
            status: "completed",
        },
        {
            vehicle_id: motorcycle.id,
            customer_name: "Sam Carter",
            customer_phone: "01711-000003",
            start_date: "2026-08-01",
            end_date: "2026-08-15",
            total_amount: (Number(motorcycle.daily_rate) * 15).toFixed(2),
            status: "ongoing",
        },
    ]);
}
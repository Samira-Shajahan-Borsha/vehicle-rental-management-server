import { database } from "../../config/knex.ts";
import {
  RentalReportQuery,
  RentalReportResponse,
  ReportVehicleRow,
} from "./report.type.ts";

interface ReportRowRaw {
  id: number;
  name: string;
  total_bookings: number;
  days_rented: number;
  revenue: string | number;
}

export class ReportService {
  public async getRentalReport(
    query: RentalReportQuery,
  ): Promise<RentalReportResponse> {
    const month = query.month as string;
    const vehicleId = query.vehicle_id;

    const [year, monthIndex] = month.split("-").map(Number);
    const monthStart = `${month}-01`;
    const lastDay = new Date(year, monthIndex, 0).getDate();
    const monthEnd = `${month}-${String(lastDay).padStart(2, "0")}`;

    const vehicleFilter = vehicleId ? " AND v.id = ?" : "";

    const bindings: Array<string | number> = [
      monthEnd,
      monthStart,
      monthEnd,
      monthStart,
      monthEnd,
      monthStart,
    ];

    if (vehicleId !== undefined) {
      bindings.push(vehicleId);
    }

    const { rows } = await database.raw<{ rows: ReportRowRaw[] }>(
      `
                SELECT
                    v.id,
                    v.name,
                    COUNT(r.id)::int AS total_bookings,
                    COALESCE(
                        SUM(
                            GREATEST(
                                0,
                                LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date) + 1
                            )
                        ),
                        0
                    )::int AS days_rented,
                    COALESCE(
                        SUM(
                            GREATEST(
                                0,
                                LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date) + 1
                            )
                        ) * v.daily_rate,
                        0
                    ) AS revenue
                FROM vehicles v
                LEFT JOIN rentals r
                    ON r.vehicle_id = v.id
                    AND r.status <> 'cancelled'
                    AND r.start_date <= ?::date
                    AND r.end_date >= ?::date
                ${vehicleFilter}
                GROUP BY v.id, v.name
                ORDER BY revenue DESC, v.id
            `,
      bindings,
    );

    const rentals: ReportVehicleRow[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      total_bookings: row.total_bookings,
      days_rented: row.days_rented,
      revenue: Number(Number(row.revenue).toFixed(2)),
    }));

    const firstRow = rentals[0];
    const topVehicle = firstRow && firstRow.revenue > 0 ? firstRow : null;

    return {
      rentals,
      topVehicle,
    };
  }
}

export const reportService = new ReportService();

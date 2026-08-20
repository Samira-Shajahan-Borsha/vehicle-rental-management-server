export interface RentalReportQuery {
  month?: string;
  vehicle_id?: number;
}

export interface ReportVehicleRow {
  id: number;
  name: string;
  total_bookings: number;
  days_rented: number;
  revenue: number;
}

export interface RentalReportResponse {
  rentals: ReportVehicleRow[];
  topVehicle: ReportVehicleRow | null;
}

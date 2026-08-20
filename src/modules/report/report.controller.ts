import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import { reportService } from "./report.service.ts";
import { RentalReportResponse } from "./report.type.ts";

const getRentalReport = catchAsync(async (req: Request, res: Response) => {
  const month =
    typeof req.query.month === "string" ? req.query.month : undefined;
  const vehicleId =
    Number(req.query.vehicle_id) > 0 ? Number(req.query.vehicle_id) : undefined;

  const result = await reportService.getRentalReport({
    month,
    vehicle_id: vehicleId,
  });

  sendResponse<RentalReportResponse>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Rental report retrieved successfully",
    data: result,
  });
});

export const ReportController = {
  getRentalReport,
};

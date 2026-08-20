import { Router } from "express";
import { checkAuth } from "../../middleware/auth.middleware.ts";
import { validateQuery } from "../../middleware/validate.middleware.ts";
import { ReportController } from "./report.controller.ts";
import { rentalReportQuerySchema } from "./report.validation.ts";
import { RentalReportQuery } from "./report.type.ts";

const router = Router();

router.use(checkAuth);

router.get(
  "/rentals",
  validateQuery<RentalReportQuery>(rentalReportQuerySchema),
  ReportController.getRentalReport,
);

export const reportRoutes = router;

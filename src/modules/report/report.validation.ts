import Joi from "joi";

export const rentalReportQuerySchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .message("month must be in YYYY-MM format"),
  vehicle_id: Joi.number().integer().positive(),
});

export type RentalReportQuerySchema = {
  month?: string;
  vehicle_id?: number;
};

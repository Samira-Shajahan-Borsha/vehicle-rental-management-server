import Joi from "joi";
import {
    CreateRentalRequestBody,
    RENTAL_STATUS,
    UpdateRentalRequestBody,
} from "./rental.type.ts";

const endDateAfterStartDate = (value: string, helpers: Joi.CustomHelpers) => {
    const startDate = (helpers.state.ancestors[0] as CreateRentalRequestBody)?.start_date;

    if (startDate && value < startDate) {
        return helpers.error("any.invalid");
    }

    return value;
};

export const createRentalValidationSchema = Joi.object<CreateRentalRequestBody>({
    vehicle_id: Joi.number().integer().positive().required().messages({
        "number.base": "Vehicle id must be a number.",
        "number.integer": "Vehicle id must be an integer.",
        "number.positive": "Vehicle id must be greater than 0.",
        "any.required": "Vehicle id is required.",
    }),
    customer_name: Joi.string().trim().min(1).max(255).required().messages({
        "string.empty": "Customer name is required.",
        "any.required": "Customer name is required.",
    }),
    customer_phone: Joi.string().trim().min(1).max(50).required().messages({
        "string.empty": "Customer phone is required.",
        "any.required": "Customer phone is required.",
    }),
    start_date: Joi.date().iso().required().messages({
        "date.base": "Start date must be a valid date (YYYY-MM-DD).",
        "date.format": "Start date must be in YYYY-MM-DD format.",
        "any.required": "Start date is required.",
    }),
    end_date: Joi.date()
        .iso()
        .required()
        .custom(endDateAfterStartDate, "end date after start date")
        .messages({
            "date.base": "End date must be a valid date (YYYY-MM-DD).",
            "date.format": "End date must be in YYYY-MM-DD format.",
            "any.required": "End date is required.",
            "any.invalid": "End date must not be earlier than start date.",
        }),
});

export const updateRentalValidationSchema = Joi.object<UpdateRentalRequestBody>({
    vehicle_id: Joi.number().integer().positive().messages({
        "number.base": "Vehicle id must be a number.",
        "number.integer": "Vehicle id must be an integer.",
        "number.positive": "Vehicle id must be greater than 0.",
    }),
    customer_name: Joi.string().trim().min(1).max(255).messages({
        "string.empty": "Customer name cannot be empty.",
    }),
    customer_phone: Joi.string().trim().min(1).max(50).messages({
        "string.empty": "Customer phone cannot be empty.",
    }),
    start_date: Joi.date().iso().messages({
        "date.base": "Start date must be a valid date (YYYY-MM-DD).",
        "date.format": "Start date must be in YYYY-MM-DD format.",
    }),
    end_date: Joi.date()
        .iso()
        .custom(endDateAfterStartDate, "end date after start date")
        .messages({
            "date.base": "End date must be a valid date (YYYY-MM-DD).",
            "date.format": "End date must be in YYYY-MM-DD format.",
            "any.invalid": "End date must not be earlier than start date.",
        }),
    status: Joi.string()
        .valid(...RENTAL_STATUS)
        .messages({
            "any.only": "Status must be one of: booked, ongoing, completed, cancelled.",
        }),
});
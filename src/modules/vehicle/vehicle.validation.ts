import Joi from "joi";
import {
    CreateVehicleRequestBody,
    UpdateVehicleRequestBody,
} from "./vehicle.type.ts";

export const createVehicleValidationSchema = Joi.object<CreateVehicleRequestBody>({
    name: Joi.string().trim().min(1).max(255).required().messages({
        "string.empty": "Vehicle name is required.",
        "any.required": "Vehicle name is required.",
    }),
    plate_number: Joi.string().trim().min(1).max(50).required().messages({
        "string.empty": "Plate number is required.",
        "any.required": "Plate number is required.",
    }),
    category: Joi.string().trim().min(1).max(100).required().messages({
        "string.empty": "Category is required.",
        "any.required": "Category is required.",
    }),
    daily_rate: Joi.number().positive().precision(2).required().messages({
        "number.base": "Daily rate must be a number.",
        "number.positive": "Daily rate must be greater than 0.",
        "any.required": "Daily rate is required.",
    }),
});

export const updateVehicleValidationSchema = Joi.object<UpdateVehicleRequestBody>({
    name: Joi.string().trim().min(1).max(255).messages({
        "string.empty": "Vehicle name cannot be empty.",
    }),
    plate_number: Joi.string().trim().min(1).max(50).messages({
        "string.empty": "Plate number cannot be empty.",
    }),
    category: Joi.string().trim().min(1).max(100).messages({
        "string.empty": "Category cannot be empty.",
    }),
    daily_rate: Joi.number().positive().precision(2).messages({
        "number.base": "Daily rate must be a number.",
        "number.positive": "Daily rate must be greater than 0.",
    }),
});
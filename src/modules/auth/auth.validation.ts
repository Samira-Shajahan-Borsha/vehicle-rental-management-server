import Joi from "joi";
import { LoginRequestBody } from "./auth.type.ts";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const loginValidationSchema = Joi.object<LoginRequestBody>({
    email: Joi.string()
        .trim()
        .lowercase()
        .pattern(emailRegex, "email")
        .required()
        .messages({
            "string.pattern.name": "Please provide a valid email address.",
            "any.required": "Email is required.",
        }),
    password: Joi.string()
        .min(8)
        .pattern(/[a-z]/, "lowercase letter")
        .pattern(/[A-Z]/, "uppercase letter")
        .pattern(/\d/, "number")
        .pattern(/[@$!%*?&^#()[\]{}\-_=+|;:'",.<>/~`]/, "special character")
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters long.",
            "string.pattern.name": "Password must contain at least one {#name}.",
            "any.required": "Password is required.",
        }),
});
import { Router } from "express";
import { validateBody } from "../../middleware/validate.middleware.ts";
import { AuthController } from "./auth.controller.ts";
import { LoginRequestBody } from "./auth.type.ts";
import { loginValidationSchema } from "./auth.validation.ts";

const router = Router();

router.post("/login", validateBody<LoginRequestBody>(loginValidationSchema), AuthController.login);

export const authRoutes = router;
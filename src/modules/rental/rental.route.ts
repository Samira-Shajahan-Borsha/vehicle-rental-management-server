import { Router } from "express";
import { checkAuth } from "../../middleware/auth.middleware.ts";
import { validateRequest } from "../../middleware/validate.middleware.ts";
import { RentalController } from "./rental.controller.ts";
import { CreateRentalRequestBody, UpdateRentalRequestBody } from "./rental.type.ts";
import {
    createRentalValidationSchema,
    updateRentalValidationSchema,
} from "./rental.validation.ts";

const router = Router();

router.use(checkAuth);

router.get("/", RentalController.getAllRentals);

router.get("/:id", RentalController.getRentalById);

router.post(
    "/",
    validateRequest<CreateRentalRequestBody>(createRentalValidationSchema),
    RentalController.createRental
);

router.put(
    "/:id",
    validateRequest<UpdateRentalRequestBody>(updateRentalValidationSchema),
    RentalController.updateRental
);

router.delete("/:id", RentalController.deleteRental);

export const rentalRoutes = router;
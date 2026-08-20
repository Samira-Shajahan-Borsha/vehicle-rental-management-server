import { Request, Router } from "express";
import { checkAuth } from "../../middleware/auth.middleware.ts";
import { validateRequest } from "../../middleware/validate.middleware.ts";
import { multerUpload } from "../../config/multer.ts";
import { deleteImageFromCloudinary } from "../../config/cloudinary.ts";
import { VehicleController } from "./vehicle.controller.ts";
import {
    CreateVehicleRequestBody,
    UpdateVehicleRequestBody,
} from "./vehicle.type.ts";
import {
    createVehicleValidationSchema,
    updateVehicleValidationSchema,
} from "./vehicle.validation.ts";

const router = Router();

router.use(checkAuth);

const cleanupUploadedPhotoOnValidationError = (req: Request): Promise<void> | void => {
    if (req.file?.path) {
        return deleteImageFromCloudinary(req.file.path);
    }
};

router.get("/", VehicleController.getAllVehicles);

router.get("/:id", VehicleController.getVehicleById);

router.post(
    "/",
    multerUpload.single("file"),
    validateRequest<CreateVehicleRequestBody>(
        createVehicleValidationSchema,
        cleanupUploadedPhotoOnValidationError
    ),
    VehicleController.createVehicle
);

router.put(
    "/:id",
    multerUpload.single("file"),
    validateRequest<UpdateVehicleRequestBody>(
        updateVehicleValidationSchema,
        cleanupUploadedPhotoOnValidationError
    ),
    VehicleController.updateVehicle
);

router.delete("/:id", VehicleController.deleteVehicle);

export const vehicleRoutes = router;
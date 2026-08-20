import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route.ts";
import { vehicleRoutes } from "../modules/vehicle/vehicle.route.ts";

const router = Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/vehicles",
        route: vehicleRoutes,
    },
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
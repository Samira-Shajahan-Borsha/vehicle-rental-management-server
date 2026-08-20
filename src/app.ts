import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { StatusCodes } from "http-status-codes";
import router from "./routes/index.ts";
import { notFound } from "./middleware/notFound.middleware.ts";
import { globalErrorHandler } from "./middleware/globalErrorHandler.middleware.ts";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Welcome to Vehicle Rental Management Server",
        environment: "development",
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString(),
    });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
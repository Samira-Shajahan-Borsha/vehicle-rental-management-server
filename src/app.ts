import express, { Application, Request, Response } from "express";
import { StatusCodes } from "http-status-codes"

const app: Application = express();

app.use(express.json());
app.set("trust proxy", 1);

app.get("/", (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Welcome to Vehicle Rental Management Server",
        environment: "development",
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString(),
    });
});

export default app;
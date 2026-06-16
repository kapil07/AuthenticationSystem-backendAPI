import express, { NextFunction, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.config.js";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./utils/common/middlewares/error.middleware.js";
import { Request } from "express";
import { AppError } from "./utils/common/errors/AppError.js";

export const app = express();

// app.set("trust proxy", 1)

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health-check", (_, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Server is working fine!",
  });
});

app.use((req: Request, _: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

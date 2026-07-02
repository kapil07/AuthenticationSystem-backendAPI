import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { AppError } from "../utils/common/errors/AppError.js";

export const validate =
  (schema: ZodObject<any>) =>
  (req: Request, _: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join(""),
        message: err.message,
      }));

      throw new AppError(
        errors.map((e) => `${e.field}: ${e.message}`).join(", "),
        400,
      );
    }

    req.body = result.data;

    next();
  };
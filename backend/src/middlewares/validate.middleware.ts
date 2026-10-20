import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { AppError } from "../utils/common/errors/AppError.js";

type validateTarget = "body" | "params" | "query"

export const validate =
  (schema: ZodObject<any>, target: validateTarget = "body") =>
  (req: Request, _: Response, next: NextFunction) => {
    const data = req[target];
    const result = schema.safeParse(data);

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

    req[target] = result.data;

    next();
  };
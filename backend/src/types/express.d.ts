import express from "express";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

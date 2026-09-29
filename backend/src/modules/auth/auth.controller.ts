import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.container.js";
import { catchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { sendResponse } from "../../utils/common/response/AppResponse.js";
import { setCookie } from "../../utils/auth/auth.helper.js";
import { AppError } from "../../utils/common/errors/AppError.js";

export const registerUserController = catchAsync(
  async (req: Request, res: Response, _: NextFunction) => {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"] || "unknown";
    const ipAddress = req.ip || "unknown";
    const result = await authService.registerUser({
      email,
      password,
      userAgent,
      ipAddress,
    });

    setCookie(res, result.refreshToken);

    sendResponse(res, 200, {
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

export const loginUserController = catchAsync(
  async (req: Request, res: Response, _: NextFunction) => {
    const { email, password } = req.body;

    const userAgent = req.headers["user-agent"] || "unknown";
    const ipAddress = req.ip || "unknown";
    const result = await authService.loginUser({
      email,
      password,
      userAgent,
      ipAddress,
    });

    setCookie(res, result.refreshToken);

    sendResponse(res, 200, {
      success: true,
      message: "User LoggedIn successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },
);

export const loggedInUserController = catchAsync(
  async (req: Request, res: Response, _: NextFunction) => {
    const user = req?.user;
    if (!user) {
      throw new AppError("User not found", 404)
    }
    const result = await authService.getLoggedInUser(user);

    sendResponse(res, 200, {
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  },
);

export const refreshTokenController = catchAsync(
  async (req: Request, res: Response, _: NextFunction) => {
    const { token } = req.body;

    const result = await authService.refreshSession(token);

    setCookie(res, result.refreshToken);

    sendResponse(res, 200, {
      success: true,
      message: "Refresh token rotated successfully",
      data: {
        accessToken: result.accessToken
      }
    })
  }
);
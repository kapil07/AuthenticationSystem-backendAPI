import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { adminService } from "./admin.container.js";
import { sendResponse } from "../../utils/common/response/AppResponse.js";

export const getAllUserController = catchAsync(
    async(req: Request, res: Response, _: NextFunction) => {

        const result = await adminService.getAllUsers();

        sendResponse(res, 200, {
            success: true,
            message : "All users fetched successfully",
            data: result
        })
    }
)
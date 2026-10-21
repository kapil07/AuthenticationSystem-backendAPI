import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { adminService } from "./admin.container.js";
import { sendResponse } from "../../utils/common/response/AppResponse.js";

export const getAllUserController = catchAsync(
    async (req: Request, res: Response, _: NextFunction) => {

        const result = await adminService.getAllUsers();

        sendResponse(res, 200, {
            success: true,
            message: "All users fetched successfully",
            data: result
        })
    }
)

export const getAllRolesController = catchAsync(
    async (req: Request, res: Response, _: NextFunction) => {
        const result = await adminService.getAllRoles();

        sendResponse(res, 200, {
            success: true,
            message: "Roles fecthed succesfully",
            data: result
        })
    }
)

export const getRoleByIdController = catchAsync(
    async (req: Request, res: Response, _: NextFunction) => {
        const roleId = req.params.roleId as string
        const result = await adminService.getRoleById(roleId);

        sendResponse(res, 200, {
            success: true,
            message: "Role info fetched successfully",
            data: result
        })
    }
)

export const createRoleController = catchAsync(
    async (req: Request, res: Response, _: NextFunction) => {

        const result = await adminService.createRole(req.body)

        sendResponse(res, 201, {
            success: true,
            message: "Role created successfully",
            data: result
        })
    }
)

export const updateRoleController = catchAsync(
    async (req: Request, res: Response, _: NextFunction) => {

        const result = await adminService.updateRole(req.params.roleId as string, req.body)

        sendResponse(res, 200, {
            success: true,
            message: "Role updated successfully",
            data: result
        })
    }
)

export const deleteRoleController = catchAsync(
    async (req: Request, res: Response, _: NextFunction) => {

        await adminService.deleteRole(req.params.roleId as string)

        sendResponse(res, 200, {
            success: true,
            message: "Role deleted successfully"
        })
    }
)

export const assignRoleToUserController = catchAsync(
    async (req: Request, res: Response, _: NextFunction) => {

        await adminService.assignRoleToUser(req.params.userId as string, req.body);

        sendResponse(res, 200, {
            success: true,
            message: "Role assigned to user successfully"
        })
    }
)


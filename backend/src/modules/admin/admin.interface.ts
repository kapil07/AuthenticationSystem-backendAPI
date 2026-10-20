import { User } from "../../../generated/prisma/index.js";
import { AllRoleType, GetRoleByIdType } from "./admin.types.js";

export interface IAdminRepository{
    getAllUsers(): Promise<User[] | null>
    getAllRoles(): Promise<AllRoleType | null>
    getRoleById(roleId: string): Promise<GetRoleByIdType | null>
}
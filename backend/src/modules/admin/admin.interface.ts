import { Role, User } from "../../../generated/prisma/index.js";
import { UpdateRoleInputDTO } from "./admin.schema.js";
import { AllRoleType, GetRoleByIdType } from "./admin.types.js";

export interface IAdminRepository{
    getAllUsers(): Promise<User[] | null>
    getAllRoles(): Promise<AllRoleType | null>
    getRoleById(roleId: string): Promise<GetRoleByIdType | null>
    getRoleByIds(roleId: string[]): Promise<Role[]>
    createRoleWithPermission(name: string, permissions: string[]): Promise<Role>
    updateRole(roleId: string, data: UpdateRoleInputDTO): Promise<Role>
    deleteRole(roleId: string): Promise<void>
    assignRoleToUser(userId: string, roleIds: string[]): Promise<void>
}
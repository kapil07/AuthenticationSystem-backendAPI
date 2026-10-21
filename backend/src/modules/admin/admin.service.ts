import { IMMUTABLE_ROLES } from "../../constants/system.role.js";
import { AppError } from "../../utils/common/errors/AppError.js";
import { toRoleByIdResponseDTO } from "./admin.dto.js";
import { IAdminRepository } from "./admin.interface.js";
import { AssignRoleSchemaDTO, CreateRoleInputDTO, UpdateRoleInputDTO } from "./admin.schema.js";

export class AdminService {
    constructor(private adminRepo: IAdminRepository) { }

    async getAllUsers() {
        const users = await this.adminRepo.getAllUsers();

        return users
    }

    async getAllRoles() {
        const roles = await this.adminRepo.getAllRoles();

        const data = roles?.map((role) => ({
            id: role.id,
            name: role.name,
            createdAt: role.createdAt,
            userCount: role.userRoles.length,
            permisions: role.rolePermissions.map((rolePermission) => rolePermission.permission.name)
        }))

        return data;
    }

    async getRoleById(roleId: string) {
        const role = await this.adminRepo.getRoleById(roleId);

        if (!role) {
            throw new AppError("Role not found", 404)
        }

        const data = toRoleByIdResponseDTO(role);

        return data;

    }

    async createRole(data: CreateRoleInputDTO) {
        const role = await this.adminRepo.createRoleWithPermission(data.name, data.permissions);

        return role;
    }

    async updateRole(roleId: string, data: UpdateRoleInputDTO) {
        const updatedRole = await this.adminRepo.updateRole(roleId, data);

        return updatedRole;
    }

    async deleteRole(roleId: string) {
        const role = await this.adminRepo.getRoleById(roleId);

        if (!role) {
            throw new AppError("Role Not found", 404);
        }

        if (IMMUTABLE_ROLES.includes(role.name as any)) {
            throw new AppError("System Roles cannot be deleted", 403)
        }

        await this.adminRepo.deleteRole(roleId);

    }

    async assignRoleToUser(userId: string, data: AssignRoleSchemaDTO) {
        const roles = await this.adminRepo.getRoleByIds(data.roleIds);

        const immutableRoles = roles.filter((role) => IMMUTABLE_ROLES.includes(role.name as any));

        if (immutableRoles.length > 0) {
            throw new AppError("Cannot assign system roles to users", 403);
        }

        await this.adminRepo.assignRoleToUser(userId, data.roleIds);
    }

    async removeUserRole(userId: string, roleId: string) {
        await this.adminRepo.removeUserRole(userId, roleId);
    }

    async getAllUsersByRoleId(roleId: string) {
        const data = await this.adminRepo.getAllUserByRoleId(roleId);

        return data;
    }

    async getUserPermissions(userId: string) {
        const user = await this.adminRepo.getUserPermissions(userId);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const permisions = user.userRoles.flatMap((userRole) =>
            userRole.role.rolePermissions.map((rolePermission) =>
                rolePermission.permission.name))

        const uniquePermissions = [...new Set(permisions)];

        return uniquePermissions
    }
}
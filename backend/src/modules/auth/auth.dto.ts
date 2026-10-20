import { UserPermissionType } from "./auth.types.js";

export const toUserPermissionResponseDTO = (user: UserPermissionType) => {
    // get roles
    const roles = user.userRoles.map((userRole) => userRole.role.name);

    // get permissions
    const permissions = user.userRoles.flatMap((userRole) => userRole.role.rolePermissions.map((rolePermission) => rolePermission.permission.name))

    const uniquePermissions = [...new Set(permissions)];

    return {
        id: user.id,
        email: user.email,
        roles,
        permissions: uniquePermissions
    }
}
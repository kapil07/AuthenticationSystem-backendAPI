import { Role, User } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/common/errors/AppError.js";
import { IAdminRepository } from "./admin.interface.js";
import { UpdateRoleInputDTO } from "./admin.schema.js";
import { AllRoleType, GetAllUserByRoleId, GetRoleByIdType, GetUserPermissions } from "./admin.types.js";

export class AdminRepository implements IAdminRepository {
    async getAllUsers(): Promise<User[] | null> {
        const users = await prisma.user.findMany();

        return users;
    }

    async getAllRoles(): Promise<AllRoleType | null> {
        const roles = await prisma.role.findMany({
            where: {
                isDeleted: false,
            },

            select: {
                id: true,
                name: true,
                createdAt: true,

                userRoles: {
                    select: {
                        userId: true
                    }
                },

                rolePermissions: {
                    select: {
                        permission: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            },

            orderBy: {
                id: 'asc'
            }
        })

        return roles;
    }

    async getRoleById(roleId: string): Promise<GetRoleByIdType | null> {
        const role = await prisma.role.findUnique({
            where: {
                id: roleId,
                isDeleted: false,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,

                userRoles: {
                    select: {
                        assignedAt: true,

                        user: {
                            select: {
                                id: true,
                                email: true,
                                createdAt: true
                            }
                        }
                    }
                },

                rolePermissions: {
                    select: {
                        assignedAt: true,

                        permission: {
                            select: {
                                id: true,
                                name: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }
        })

        return role
    }

    async getRoleByIds(roleIds: string[]): Promise<Role[]> {
        const roles = await prisma.role.findMany({
            where: {
                id: {
                    in: roleIds
                },
            },
        });

        return roles;
    }

    async createRoleWithPermission(name: string, permissions: string[]): Promise<Role> {
        return prisma.$transaction(async (tx) => {
            const existingRole = await tx.role.findFirst({
                where: {
                    name
                }
            });

            if (existingRole) {
                throw new AppError("ROLE_ALREADY_EXISTS", 409);
            }

            const dbPermissions = await tx.permission.findMany({
                where: {
                    name: {
                        in: permissions
                    }
                }
            });

            if (dbPermissions.length !== permissions.length) {
                throw new AppError("INVALID_PERMISSIONS", 400);
            }

            const role = await tx.role.create({
                data: {
                    name
                }
            });

            await tx.rolePermission.createMany({
                data: dbPermissions.map((permission) => ({
                    roleId: role.id,
                    permissionId: permission.id
                }))
            });

            return role;
        });
    }

    async updateRole(roleId: string, data: UpdateRoleInputDTO): Promise<Role> {
        return prisma.$transaction(async (tx) => {
            const existingRole = await tx.role.findFirst({
                where: {
                    id: roleId
                },

                include: {
                    rolePermissions: true
                }
            });

            if (!existingRole) {
                throw new AppError("ROLE_NOT_FOUND", 404)
            }

            if (data.name) {
                const duplicateRole = await tx.role.findFirst({
                    where: {
                        name: data.name,
                        NOT: {
                            id: roleId
                        }
                    },
                });

                if (duplicateRole) {
                    throw new AppError("ROLE_ALREADY_EXISTS", 409)
                }
            }

            const updateRole = await tx.role.update({
                where: {
                    id: roleId
                },

                data: {
                    ...(data.name && {
                        name: data.name
                    }),
                },
            });

            if (data.permissions) {
                const dbPermissions = await tx.permission.findMany({
                    where: {
                        name: {
                            in: data.permissions
                        }
                    }
                });

                if (dbPermissions.length !== data.permissions.length) {
                    throw new AppError("INVALID_PERMISSIONS", 400)
                }

                // delete the old permissions
                await tx.rolePermission.deleteMany({
                    where: {
                        roleId
                    }
                });

                // insert new Permissions
                await tx.rolePermission.createMany({
                    data: dbPermissions.map((permission) => ({
                        roleId,
                        permissionId: permission.id
                    })),
                });
            }

            return updateRole;

        })
    }

    async deleteRole(roleId: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const existingRole = await tx.role.findUnique({
                where: {
                    id: roleId,
                    isDeleted: false
                },
                include: {
                    userRoles: true
                }
            });

            if (!existingRole) {
                throw new AppError("ROLE_NOT_FOUND", 404);
            }

            if (existingRole.userRoles.length > 0) {
                throw new AppError("ROLE_ASSIGNES_TO_USER", 409);
            }

            await tx.role.update({
                where: {
                    id: roleId
                },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            })

            return true;

        })
    }

    async assignRoleToUser(userId: string, roleIds: string[]): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const exisitngUser = await tx.user.findUnique({
                where: {
                    id: userId,
                }
            })

            if (!exisitngUser) {
                throw new AppError("USER_NOT_FOUND", 404);
            }

            const roles = await tx.role.findMany({
                where: {
                    id: {
                        in: roleIds,
                    },
                    isDeleted: false
                },
            });

            if (roles.length !== roleIds.length) {
                throw new AppError("INVALID_ROLES", 400);
            }

            const existingAssignments = await tx.userRole.findMany({
                where: {
                    userId,
                    roleId: {
                        in: roleIds
                    },
                },
            });

            const existingRoleIds = new Set(existingAssignments.map((assignment) => assignment.roleId))

            const newAssignment = roleIds.filter((roleId) => !existingRoleIds.has(roleId));

            if (newAssignment.length === 0) {
                throw new AppError("ROLES_ALREADY_ASSIGNED", 409);
            }

            await tx.userRole.createMany({
                data: newAssignment.map((roleId) => ({
                    userId,
                    roleId
                })),
            });

            return true;

        });
    }

    async removeUserRole(userId: string, roleId: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const assignment = await tx.userRole.findUnique({
                where: {
                    userId_roleId: {
                        userId,
                        roleId
                    },
                },
                include: {
                    role: true
                }
            });

            if (!assignment) {
                throw new AppError("ROLE_NOT_ASSIGNED_TO_USER", 404);
            }

            if (assignment.role.name === "ADMIN") {
                const adminCount = await tx.userRole.count({
                    where: {
                        role: {
                            name: "ADMIN"
                        },
                    },
                });

                if (adminCount <= 1) {
                    throw new AppError("LAST_ADMIN_ROLE", 403);
                }
            };

            await tx.userRole.delete({
                where: {
                    userId_roleId: {
                        userId,
                        roleId
                    },
                },
            });

            return true;
        });
    }

    async getAllUserByRoleId(roleId: string): Promise<GetAllUserByRoleId> {
        const users = await prisma.userRole.findMany({
            where: {
                roleId,
            },
            select: {
                user: {
                    select: {
                        id: true,
                        email: true
                    },
                },
            },
        });

        return users
    }

    async getUserPermissions(userId: string): Promise<GetUserPermissions | null> {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return user
    }
}
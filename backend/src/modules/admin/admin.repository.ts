import { User } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { IAdminRepository } from "./admin.interface.js";
import { AllRoleType, GetRoleByIdType } from "./admin.types.js";

export class AdminRepository implements IAdminRepository {
    async getAllUsers(): Promise<User[] | null> {
        const users = await prisma.user.findMany();

        return users;
    }

    async getAllRoles(): Promise<AllRoleType | null> {
        const roles = await prisma.role.findMany({
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
                id: roleId
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
}
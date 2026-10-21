import { Prisma } from "../../../generated/prisma/index.js";

export type AllRoleType = Prisma.RoleGetPayload<{
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
    }
}>[]

export type GetRoleByIdType = Prisma.RoleGetPayload<{
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
}>

export type GetAllUserByRoleId = Prisma.UserRoleGetPayload<{
    select: {
        user: {
            select: {
                id: true,
                email: true
            },
        },
    },
}>[]

export type GetUserPermissions = Prisma.UserGetPayload<{
    where: {
        id: true,
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
}>
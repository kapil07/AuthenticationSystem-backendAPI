import { env } from "../src/config/env.config.ts"
import { Permissions } from "../src/constants/permissions.ts"
import { prisma } from "../src/lib/prisma.ts"
import { hashPassword } from "../src/utils/auth/password.ts"

async function main() {
    const permissions = [
        Permissions.MANAGE_USERS,
        Permissions.MANAGE_ROLES,
        Permissions.VIEW_ANALYTICS,
        Permissions.DELETE_POSTS
    ]

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: {
                name: permission
            },

            update: {},

            create: {
                name: permission
            }
        })
    }

    // Admin Role
    const adminRole = await prisma.role.upsert({
        where: {
            name: "ADMIN"
        },

        update: {},

        create: {
            name: "ADMIN"
        }
    })

    // Assign permission to role
    const dbPermissions = await prisma.permission.findMany();

    for (const permission of dbPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: permission.id
                }
            },

            update: {},

            create: {
                roleId: adminRole.id,
                permissionId: permission.id
            }
        })
    }

    // create the inital admin
    const existingAdmin = await prisma.user.findUnique({
        where: {
            email: env.ADMIN_EMAIL
        },
    })

    let adminUser;

    if (!existingAdmin) {
        const hashedPassword = await hashPassword(env.ADMIN_PASSWORD)

        adminUser = await prisma.user.create({
            data: {
                email: env.ADMIN_EMAIL,
                passwordHash: hashedPassword
            }
        });

        console.log("Admin user created")

    } else {
        adminUser = existingAdmin

        console.log("Admin user already exists");
    }

    // assign admin role to the user
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id
            },
        },

        update: {},

        create: {
            userId: adminUser.id,
            roleId: adminRole.id
        }
    })
    console.log("Admin role assigned successfully");

    console.log("Seed completed successfully");
}

main().catch(console.error).finally(async () => {
    prisma.$disconnect()
})
import express from 'express'
import { authMiddleware } from '../../middlewares/authentication.middleware.js'
import { authorizePermissions } from '../../middlewares/authorization.middleware.js'
import { Permissions } from '../../constants/permissions.js'
import { assignRoleToUserController, createRoleController, deleteRoleController, getAllRolesController, getAllUserController, getAllUserOfRoleController, getRoleByIdController, getUserPermissionsController, removeRoleFromUserController, updateRoleController } from './admin.controller.js'
import { validate } from '../../middlewares/validate.middleware.js'
import { assignRoleSchema, createRoleSchema, removeUserRoleParamsSchema, roleIdSchema, updateRoleSchema, userIdSchema } from './admin.schema.js'

const router = express.Router()

router.route("/all-users").get(authMiddleware, authorizePermissions(Permissions.MANAGE_USERS), getAllUserController)
router.route("/roles").get(authMiddleware, authorizePermissions(Permissions.MANAGE_ROLES), getAllRolesController)
router.route("/roles/:roleId").get(authMiddleware, authorizePermissions(Permissions.MANAGE_ROLES), validate(roleIdSchema, "params"), getRoleByIdController)
router.route("/roles").post(authMiddleware, authorizePermissions(Permissions.MANAGE_ROLES), validate(createRoleSchema), createRoleController)
router.route("/roles/:roleId")
    .patch(
        authMiddleware,
        authorizePermissions(Permissions.MANAGE_ROLES),
        validate(roleIdSchema, "params"),
        validate(updateRoleSchema),
        updateRoleController)
router.route("/roles/:roleId")
    .delete(
        authMiddleware,
        authorizePermissions(Permissions.MANAGE_ROLES),
        validate(roleIdSchema, "params"),
        deleteRoleController)
router.route("/users/:userId/roles")
    .post(
        authMiddleware,
        authorizePermissions(Permissions.MANAGE_ROLES),
        validate(userIdSchema, "params"),
        validate(assignRoleSchema),
        assignRoleToUserController
    )
router.route("/users/:userId/roles/:roleId")
    .delete(
        authMiddleware,
        authorizePermissions(Permissions.MANAGE_ROLES),
        validate(removeUserRoleParamsSchema, "params"),
        removeRoleFromUserController
    )
router
    .route("/users/roles/:roleId")
    .get(
        authMiddleware,
        authorizePermissions(Permissions.MANAGE_ROLES),
        validate(roleIdSchema, "params"),
        getAllUserOfRoleController,
    );
router.route("/users/:userId/permissions")
    .get(
        authMiddleware,
        authorizePermissions(Permissions.MANAGE_USERS),
        validate(userIdSchema,"params"),
        getUserPermissionsController
    )
export default router
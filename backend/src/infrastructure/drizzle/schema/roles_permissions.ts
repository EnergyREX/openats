import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { roles } from "./roles.ts";
import { permissions } from "./permissions.ts";

export const rolesPermissions = pgTable('roles_permissions', {
    role_uuid: uuid('role_uuid').references(() => roles.uuid),
    permission_id: integer('permission_id').references(() => permissions.id)
})
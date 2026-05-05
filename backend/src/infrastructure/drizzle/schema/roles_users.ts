import { pgTable, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.ts";
import { roles } from "./roles.ts";

export const rolesUsers = pgTable('roles_users', {
    user_uuid: uuid('user_uuid').references(() => users.uuid),
    role_uuid: uuid('role_uuid').references(() => roles.uuid)
})
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const roles = pgTable('roles', {
    uuid: uuid('uuid').primaryKey(),
    name: varchar('name').notNull(),
    description: varchar('description')
})
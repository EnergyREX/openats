import { jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

export const settings = pgTable('settings', {
    key: varchar('key').notNull().primaryKey(),
    value: jsonb('value')
})
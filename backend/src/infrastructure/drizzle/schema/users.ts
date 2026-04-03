import { boolean, date, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    uuid: uuid('uuid').notNull().primaryKey(),
    name: varchar('name').notNull(),
    email: varchar('email').notNull(),
    password: varchar('password').notNull(),
    verificationCode: varchar('verification_code'),
    verified: boolean('verified').notNull().default(false),
    joinedAt: date('joined_at').defaultNow()
})
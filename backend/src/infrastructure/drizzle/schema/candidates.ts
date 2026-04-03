import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const candidates = pgTable('candidates', {
    uuid: uuid('uuid').notNull().primaryKey(),
    name: varchar('name').notNull(),
    title: varchar('title').notNull(),
    about: text('about').notNull(),
    skills: text('skills').array().notNull(),
    email: varchar('email'),
    phone: varchar('phone'),
    address: varchar('address'),
})
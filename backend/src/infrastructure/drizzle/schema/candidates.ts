import { jsonb, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const candidates = pgTable('candidates', {
    uuid: uuid('uuid').notNull().primaryKey(),
    name: varchar('name').notNull(),
    title: varchar('title').notNull(),
    about: text('about').notNull(),
    skills: text('skills').array().notNull(),
    email: varchar('email').unique(),
    phone: varchar('phone'),
    address: varchar('address'),
    website: varchar('website'),
    github: varchar('github'),
    linkedin: varchar('linkedin'),
    experience: jsonb('experience'),
    projects: jsonb('projects'),
    education: jsonb('education'),
    certifications: jsonb('certifications'),
    languages: jsonb('languages'),
    volunteering: jsonb('volunteering').array(),
    additionalInfo: jsonb('additional_info').array(),
    cvUrl: varchar('cv_url')
})

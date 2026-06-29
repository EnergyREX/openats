import { jsonb, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const jobPostings = pgTable('job_posting', {
    uuid: uuid('uuid').notNull().primaryKey(),
    ownerUuid: uuid('owner_uuid').notNull().references(() => users.uuid),
    title: varchar('title').notNull(),
    body: text('body').notNull(),
    recruiterContact: jsonb('recruiter_contact'),
    company: jsonb('company'),
    location: jsonb('location'),
    salary: jsonb('salary'),
    requirements: jsonb('requirements')
})
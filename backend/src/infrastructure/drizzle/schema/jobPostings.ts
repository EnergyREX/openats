import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const jobPostings = pgTable('job_posting', {
    uuid: uuid('uuid').notNull().primaryKey(),
    title: varchar('title').notNull(),
    body: text('body').notNull(),
    recruiterName: varchar('recruiter_name'),
    recruiterPhone: varchar('recruiter_phone'),
    recruiterEmail: varchar('recruiter_email'),
})
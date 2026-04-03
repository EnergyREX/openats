import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { candidates } from "./candidates.ts";
import { jobPostings } from "./jobPostings.ts";

export const applications = pgTable('applications', {
    uuid: uuid('uuid').notNull().primaryKey(),
    offerUuid: uuid('offer_uuid').notNull().references(() => jobPostings.uuid),
    candidateUuid: uuid('candidate_uuid').notNull().references(() => candidates.uuid),
    score: integer('score'),
    annotations: text('annotations').array(),
    isValid: boolean('is_valid'),
})
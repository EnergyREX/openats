import { boolean, integer, jsonb, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { candidates } from "./candidates.ts";
import { jobPostings } from "./jobPostings.ts";

export const applications = pgTable('applications', {
    uuid: uuid('uuid').notNull().primaryKey(),
    offerUuid: uuid('offer_uuid').notNull().references(() => jobPostings.uuid),
    candidateUuid: uuid('candidate_uuid').notNull().references(() => candidates.uuid),
    score: integer('score'),
    annotations: jsonb('annotations').array(),
    discarded: boolean('discarded').default(false),
    suggestedStatus: varchar('suggested_status'),
    discardReason: text('discard_reason')
})
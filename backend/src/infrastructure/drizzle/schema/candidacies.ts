import { integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { candidates } from "./candidates.ts";
import { jobPostings } from "./jobPostings.ts";
import { CandidacyAnnotation } from "../../../domain/offers/value-objects/CandidacyAnnotation.ts";

export const candidacies = pgTable('candidacies', {
    uuid:              uuid('uuid').notNull().primaryKey(),
    offerUuid:         uuid('offer_uuid').notNull().references(() => jobPostings.uuid),
    candidateUuid:     uuid('candidate_uuid').notNull().references(() => candidates.uuid),
    status:            varchar('status').notNull(),
    currentPhaseOrder: integer('current_phase_order').notNull().default(0),
    score:             integer('score').notNull().default(-1),
    annotations:       jsonb('annotations').$type<CandidacyAnnotation[]>().notNull().default([]),
    rejectReason:      text('reject_reason').notNull().default(''),
    createdAt:         timestamp('created_at').notNull().defaultNow(),
    updatedAt:         timestamp('updated_at').notNull().defaultNow(),
})

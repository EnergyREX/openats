import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const revokedTokens = pgTable('revoked_tokens', {
    token: varchar('token').notNull(),
    expires_at: integer('expires_at').notNull(),
    created_at: integer('created_at').notNull()
})
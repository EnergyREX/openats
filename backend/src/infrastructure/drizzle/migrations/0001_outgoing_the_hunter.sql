CREATE TABLE "revoked_tokens" (
	"token" varchar NOT NULL,
	"expires_at" integer NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_code" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;
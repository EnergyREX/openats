CREATE TABLE "candidacies" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"offer_uuid" uuid NOT NULL,
	"candidate_uuid" uuid NOT NULL,
	"status" varchar NOT NULL,
	"current_phase_order" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT -1 NOT NULL,
	"annotations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reject_reason" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"title" varchar NOT NULL,
	"about" text NOT NULL,
	"skills" text[] NOT NULL,
	"email" varchar,
	"phone" varchar,
	"address" varchar,
	"website" varchar,
	"github" varchar,
	"linkedin" varchar,
	"experience" jsonb,
	"projects" jsonb,
	"education" jsonb,
	"certifications" jsonb,
	"languages" jsonb,
	"volunteering" jsonb,
	"additional_info" jsonb,
	"cv_url" varchar,
	CONSTRAINT "candidates_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "job_posting" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"owner_uuid" uuid NOT NULL,
	"title" varchar NOT NULL,
	"body" text NOT NULL,
	"recruiter_contact" jsonb,
	"company" jsonb,
	"location" jsonb,
	"salary" jsonb,
	"requirements" jsonb
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revoked_tokens" (
	"token" varchar PRIMARY KEY NOT NULL,
	"expires_at" integer NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles_permissions" (
	"role_uuid" uuid,
	"permission_id" integer
);
--> statement-breakpoint
CREATE TABLE "roles_users" (
	"user_uuid" uuid,
	"role_uuid" uuid
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"verification_code" varchar,
	"verified" boolean DEFAULT false NOT NULL,
	"joined_at" date DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "candidacies" ADD CONSTRAINT "candidacies_offer_uuid_job_posting_uuid_fk" FOREIGN KEY ("offer_uuid") REFERENCES "public"."job_posting"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidacies" ADD CONSTRAINT "candidacies_candidate_uuid_candidates_uuid_fk" FOREIGN KEY ("candidate_uuid") REFERENCES "public"."candidates"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_owner_uuid_users_uuid_fk" FOREIGN KEY ("owner_uuid") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_role_uuid_roles_uuid_fk" FOREIGN KEY ("role_uuid") REFERENCES "public"."roles"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_users" ADD CONSTRAINT "roles_users_user_uuid_users_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_users" ADD CONSTRAINT "roles_users_role_uuid_roles_uuid_fk" FOREIGN KEY ("role_uuid") REFERENCES "public"."roles"("uuid") ON DELETE no action ON UPDATE no action;
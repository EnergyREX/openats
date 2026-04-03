CREATE TABLE "days" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"realDay" date DEFAULT now(),
	"daily_thought" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_instances" (
	"user_uuid" uuid,
	"habit_uuid" uuid,
	"day" uuid,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"repeat_every" varchar NOT NULL,
	"created_at" date DEFAULT now(),
	"active_from" date DEFAULT now(),
	"inactive_from" date
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"joined_at" date DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "habit_instances" ADD CONSTRAINT "habit_instances_user_uuid_users_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_instances" ADD CONSTRAINT "habit_instances_habit_uuid_habits_uuid_fk" FOREIGN KEY ("habit_uuid") REFERENCES "public"."habits"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_instances" ADD CONSTRAINT "habit_instances_day_days_uuid_fk" FOREIGN KEY ("day") REFERENCES "public"."days"("uuid") ON DELETE no action ON UPDATE no action;
CREATE TABLE "settings" (
	"key" varchar PRIMARY KEY NOT NULL,
	"value" jsonb
);
--> statement-breakpoint
INSERT INTO "permissions" ("name")
SELECT "new_permission"."name"
FROM (VALUES ('settings:read'), ('settings:write')) AS "new_permission" ("name")
WHERE EXISTS (SELECT 1 FROM "roles" WHERE "name" = 'admin')
	AND NOT EXISTS (SELECT 1 FROM "permissions" WHERE "permissions"."name" = "new_permission"."name");
--> statement-breakpoint
INSERT INTO "roles_permissions" ("role_uuid", "permission_id")
SELECT "roles"."uuid", "permissions"."id"
FROM "roles"
CROSS JOIN "permissions"
WHERE "roles"."name" = 'admin'
	AND "permissions"."name" IN ('settings:read', 'settings:write')
	AND NOT EXISTS (
		SELECT 1 FROM "roles_permissions"
		WHERE "roles_permissions"."role_uuid" = "roles"."uuid"
			AND "roles_permissions"."permission_id" = "permissions"."id"
	);

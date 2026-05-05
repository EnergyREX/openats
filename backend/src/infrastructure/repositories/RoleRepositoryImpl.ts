import { eq } from 'drizzle-orm'
import db from '../../config/database.ts'
import { GenericError } from '../../domain/shared/errors/Generic.error.js'
import { Result } from '../../domain/shared/types/Result.ts'
import { Role } from '../../domain/users/aggregates/Role.ts'
import { IRoleRepository } from '../../domain/users/repositories/IRoleRepository.ts'
import { Permission } from '../../domain/users/value-objects/Permission.ts'
import { permissions } from '../drizzle/schema/permissions.ts'
import { roles } from '../drizzle/schema/roles.ts'
import { rolesPermissions } from '../drizzle/schema/roles_permissions.ts'
import { rolesUsers } from '../drizzle/schema/roles_users.ts'

export class RoleRepositoryImpl implements IRoleRepository {

    async save(value: Role): Promise<Result<string, GenericError>> {
        try {
            await db.insert(roles).values({
                uuid: value.getUUID(),
                name: value.getName(),
                description: value.getDescription(),
            })
            return { ok: true, value: value.getUUID() }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: 'ERR_ROLE_CREATE' } }
            }
            return { ok: false, error: { message: 'Unknown error', code: 'ERR_ROLE_CREATE' } }
        }
    }

    async getAll(): Promise<Result<Role[], GenericError>> {
        try {
            const rows = await db
                .select({
                    uuid: roles.uuid,
                    name: roles.name,
                    description: roles.description,
                    permissionId: permissions.id,
                    permissionName: permissions.name,
                })
                .from(roles)
                .leftJoin(rolesPermissions, eq(rolesPermissions.role_uuid, roles.uuid))
                .leftJoin(permissions, eq(permissions.id, rolesPermissions.permission_id))

            return { ok: true, value: this.groupRowsIntoRoles(rows) }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: 'ERR_ROLE_GET_ALL' } }
            }
            return { ok: false, error: { message: 'Unknown error', code: 'ERR_ROLE_GET_ALL' } }
        }
    }

    async getByUUID(uuid: string): Promise<Result<Role, GenericError>> {
        try {
            const rows = await db
                .select({
                    uuid: roles.uuid,
                    name: roles.name,
                    description: roles.description,
                    permissionId: permissions.id,
                    permissionName: permissions.name,
                })
                .from(roles)
                .leftJoin(rolesPermissions, eq(rolesPermissions.role_uuid, roles.uuid))
                .leftJoin(permissions, eq(permissions.id, rolesPermissions.permission_id))
                .where(eq(roles.uuid, uuid))

            if (rows.length === 0) {
                return { ok: false, error: { message: 'Role not found', code: 'ERR_ROLE_NOT_FOUND' } }
            }

            const perms = rows
                .filter(r => r.permissionId !== null && r.permissionName !== null)
                .map(r => Permission.create(r.permissionId!, r.permissionName!))

            const role = Role.create(rows[0].uuid, rows[0].name, rows[0].description ?? '', perms)
            return { ok: true, value: role }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: 'ERR_ROLE_NOT_FOUND' } }
            }
            return { ok: false, error: { message: 'Unknown error', code: 'ERR_ROLE_NOT_FOUND' } }
        }
    }

    async getByUserUUID(userUuid: string): Promise<Result<Role[], GenericError>> {
        try {
            const rows = await db
                .select({
                    uuid: roles.uuid,
                    name: roles.name,
                    description: roles.description,
                    permissionId: permissions.id,
                    permissionName: permissions.name,
                })
                .from(rolesUsers)
                .innerJoin(roles, eq(roles.uuid, rolesUsers.role_uuid))
                .leftJoin(rolesPermissions, eq(rolesPermissions.role_uuid, roles.uuid))
                .leftJoin(permissions, eq(permissions.id, rolesPermissions.permission_id))
                .where(eq(rolesUsers.user_uuid, userUuid))

            return { ok: true, value: this.groupRowsIntoRoles(rows) }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: 'ERR_ROLE_GET_BY_USER' } }
            }
            return { ok: false, error: { message: 'Unknown error', code: 'ERR_ROLE_GET_BY_USER' } }
        }
    }

    async update(value: Role): Promise<Result<void, GenericError>> {
        try {
            await db.update(roles)
                .set({ name: value.getName(), description: value.getDescription() })
                .where(eq(roles.uuid, value.getUUID()))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: 'ERR_ROLE_UPDATE' } }
            }
            return { ok: false, error: { message: 'Unknown error', code: 'ERR_ROLE_UPDATE' } }
        }
    }

    async delete(uuid: string): Promise<Result<void, GenericError>> {
        try {
            await db.delete(roles).where(eq(roles.uuid, uuid))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: 'ERR_ROLE_DELETE' } }
            }
            return { ok: false, error: { message: 'Unknown error', code: 'ERR_ROLE_DELETE' } }
        }
    }

    private groupRowsIntoRoles(rows: {
        uuid: string
        name: string
        description: string | null
        permissionId: number | null
        permissionName: string | null
    }[]): Role[] {
        const roleMap = new Map<string, { name: string; description: string | null; perms: Permission[] }>()

        for (const row of rows) {
            if (!roleMap.has(row.uuid)) {
                roleMap.set(row.uuid, { name: row.name, description: row.description, perms: [] })
            }
            if (row.permissionId !== null && row.permissionName !== null) {
                roleMap.get(row.uuid)!.perms.push(Permission.create(row.permissionId, row.permissionName))
            }
        }

        return [...roleMap.entries()].map(([uuid, r]) =>
            Role.create(uuid, r.name, r.description ?? '', r.perms)
        )
    }
}

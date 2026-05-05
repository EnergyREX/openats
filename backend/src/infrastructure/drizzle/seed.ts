import 'dotenv/config'
import { randomUUID } from 'crypto'
import db from '../../config/database.ts'
import { permissions } from './schema/permissions.ts'
import { roles } from './schema/roles.ts'
import { rolesPermissions } from './schema/roles_permissions.ts'

const PERMISSIONS = [
    'jobs:write', 'jobs:read',
    'candidates:write', 'candidates:read',
    'applications:write', 'applications:read',
    'roles:write', 'roles:read',
    'users:write', 'users:read',
]

const ROLES = [
    { uuid: randomUUID(), name: 'admin',     description: 'Full access to all resources' },
    { uuid: randomUUID(), name: 'recruiter', description: 'Manages jobs, candidates and applications' },
    { uuid: randomUUID(), name: 'viewer',    description: 'Read-only access' },
]

const RECRUITER_PERMISSIONS = [
    'jobs:write', 'jobs:read',
    'candidates:write', 'candidates:read',
    'applications:write', 'applications:read',
]

async function seed() {
    const existing = await db.select().from(permissions)
    if (existing.length > 0) {
        console.log('Database already seeded. Skipping.')
        process.exit(0)
    }

    console.log('Seeding permissions...')
    const insertedPerms = await db
        .insert(permissions)
        .values(PERMISSIONS.map(name => ({ name })))
        .returning()
    console.log(`  ${insertedPerms.length} permissions inserted`)

    console.log('Seeding roles...')
    const insertedRoles = await db
        .insert(roles)
        .values(ROLES)
        .returning()
    console.log(`  ${insertedRoles.length} roles inserted`)

    const permByName = Object.fromEntries(insertedPerms.map(p => [p.name, p.id]))
    const roleByName = Object.fromEntries(insertedRoles.map(r => [r.name, r.uuid]))

    const associations: { role_uuid: string; permission_id: number }[] = []

    for (const perm of insertedPerms) {
        associations.push({ role_uuid: roleByName['admin'], permission_id: perm.id })
    }

    for (const name of RECRUITER_PERMISSIONS) {
        associations.push({ role_uuid: roleByName['recruiter'], permission_id: permByName[name] })
    }

    for (const perm of insertedPerms.filter(p => p.name.endsWith(':read'))) {
        associations.push({ role_uuid: roleByName['viewer'], permission_id: perm.id })
    }

    console.log('Seeding role-permission associations...')
    await db.insert(rolesPermissions).values(associations)
    console.log(`  ${associations.length} associations inserted`)

    console.log('Done!')
    process.exit(0)
}

seed().catch(err => {
    console.error(err)
    process.exit(1)
})

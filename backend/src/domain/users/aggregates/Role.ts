import { UUID } from "src/domain/shared/value-objects/UUID.ts"
import { Permission } from "../value-objects/Permission.ts"

export class Role {
    constructor(
        private uuid: UUID,
        private name: string,
        private description: string,
        private permissions: Permission[]
    ) { }

    static create(uuid: string, name: string, description: string, permissions: Permission[]) {
        const rUuid = new UUID(uuid)
        return new Role(rUuid, name, description, permissions)
    }

    getUUID(): string { return this.uuid.toPrimitive() }
    getName(): string { return this.name }
    getDescription(): string { return this.description } 
    getPermissions(): Permission[] { return this.permissions }
}
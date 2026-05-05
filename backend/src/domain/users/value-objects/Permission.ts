export class Permission {
    constructor(
        private id: number,
        private name: string,
    ) { }

    static create(id: number, name: string) {
        return new Permission(id, name)
    }

    getUUID(): number { return this.id }
    getName(): string { return this.name }
}
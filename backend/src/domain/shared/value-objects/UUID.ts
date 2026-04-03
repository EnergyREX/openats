export class UUID {
    private readonly value: string

    constructor(value: string) {
        const regex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/

        if (regex.test(value)) {
            this.value = value
        } else {
            throw new Error('[DOMAIN] - Could not create an UUID because it does not match with pattern!')
        }
    }

    toPrimitive(): string {
        return this.value
    }
}
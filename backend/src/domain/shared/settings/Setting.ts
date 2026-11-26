import { GenericError } from "../errors/Generic.error.js"
import { Ok, Result } from "../types/Result.ts"

export class Setting {
    constructor (
        private readonly key: string,
        private value: object | unknown
    ) {}

    static reconstitute(key: string, value: object | unknown) {
        return new Setting(key, value)
    }

    updateValue(value: object): Result<undefined, GenericError> { 
        this.value = value
        return Ok(undefined)
    } 

    getKey(): string { return this.key }
    getValue(): object | unknown { return this.value }

}
import { GenericError } from "../errors/Generic.error.js";
import { Result } from "../types/Result.ts";
import { Setting } from "./Setting.ts";

export interface ISettingsRepository {

    getAll(): Promise<Result<Setting[], GenericError>>
    getByKey(key: string): Promise<Result<Setting, GenericError>>

    upsert(setting: Setting): Promise<Result<undefined, GenericError>>
    update(setting: Setting): Promise<Result<undefined, GenericError>>
}
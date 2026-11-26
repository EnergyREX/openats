import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { ISettingsRepository } from "src/domain/shared/settings/ISettingsRepository.ts";
import { Setting } from "src/domain/shared/settings/Setting.ts";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export async function getSetting(repo: ISettingsRepository, key: string): Promise<Result<Setting, GenericError>> {
    const data = await repo.getByKey(key)
    if (!data.ok) { return Err(data.error) }
    return Ok(data.value)

}
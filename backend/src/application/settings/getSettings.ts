import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { ISettingsRepository } from "src/domain/shared/settings/ISettingsRepository.ts";
import { Setting } from "src/domain/shared/settings/Setting.ts";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export async function getSettings(repo: ISettingsRepository): Promise<Result<Setting[], GenericError>> {
    const data = await repo.getAll()
    if (!data.ok) { return Err(data.error) }
    return Ok(data.value)

}
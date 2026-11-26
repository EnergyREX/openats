import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { toError } from "src/domain/shared/helpers/ToError.ts";
import { ISettingsRepository } from "src/domain/shared/settings/ISettingsRepository.ts";
import { Setting } from "src/domain/shared/settings/Setting.ts";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export async function updateSetting(repo: ISettingsRepository, setting: Setting): Promise<Result<undefined, GenericError>> {
    const data = await repo.upsert(setting)
    try {
        if (!data.ok) { return Err(data.error) }
        return Ok(data.value)

    } catch (err) {
        return Err(toError(err, 'ERR_UPDATE_SETTING'))
    }
}
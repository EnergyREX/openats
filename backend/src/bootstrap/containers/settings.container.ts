import { getSetting } from "src/application/settings/getOneSetting.ts";
import { getSettings } from "src/application/settings/getSettings.ts";
import { updateSetting } from "src/application/settings/updateSetting.ts";
import { Setting } from "src/domain/shared/settings/Setting.ts";
import { SettingsRepositoryImpl } from "src/infrastructure/repositories/SettingsRepositoryImpl.ts";

const settingsRepository = new SettingsRepositoryImpl()

export const settingsContainer = {
    getAll: () => getSettings(settingsRepository),
    getOne: (key: string) => getSetting(settingsRepository, key),
    update: (key: string, value: object) => updateSetting(settingsRepository, new Setting(key, value))
}

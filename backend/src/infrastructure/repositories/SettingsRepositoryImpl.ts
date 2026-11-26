import db from '../../config/database.ts'
import { Err, Ok, Result } from '../../domain/shared/types/Result.ts'
import { toError } from '../../domain/shared/helpers/ToError.ts'
import { Setting } from '../../domain/shared/settings/Setting.ts'
import { ISettingsRepository } from '../../domain/shared/settings/ISettingsRepository.ts'
import type { GenericError } from '../../domain/shared/errors/Generic.error.js'
import { settings } from '../drizzle/schema/settings.ts'
import { eq } from 'drizzle-orm'

export class SettingsRepositoryImpl implements ISettingsRepository {

    private dbToAggregate(d: typeof settings.$inferSelect): Setting {
        return Setting.reconstitute(d.key, d.value)
    }

    async getAll(): Promise<Result<Setting[], GenericError>> {
        try {
            const data = await db.select().from(settings)

            const allSettings: Setting[] = []
            data.map((data) => {
                allSettings.push(this.dbToAggregate(data))
            })

            return Ok(allSettings)
        } catch (err) {
            return Err(toError(err, 'ERR_SETTINGS_GET_ALL'))
        }
    }

    async getByKey(key: string): Promise<Result<Setting, GenericError>> {
        try {
            const data = await db.select().from(settings).where(eq(settings.key, key))

            if (!data[0]) {
                return Err({ message: 'Setting not found', code: 'ERR_SETTING_NOT_FOUND' })
            }

            const obj = this.dbToAggregate(data[0])

            return Ok(obj)
        } catch (err) {
            return Err(toError(err, 'ERR_SETTING_GET_BY_KEY'))
        }
    }

    async upsert(setting: Setting): Promise<Result<undefined, GenericError>> {
        try {
            await db.insert(settings).values({
                key: setting.getKey(),
                value: setting.getValue(),
            }).onConflictDoUpdate({
                target: settings.key,
                set: { value: setting.getValue() }
            })
        
            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_UPSERT_SETTING'))
        }
    }

    async update(setting: Setting): Promise<Result<undefined, GenericError>> {
        try {
            await db.update(settings).set({
                value: setting.getValue()
            }).where(eq(settings.key, setting.getKey()));

            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_UPDATE_SETTING'))
        }
    }
}

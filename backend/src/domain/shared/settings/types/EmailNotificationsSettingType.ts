import { BaseSetting } from "../BaseSetting.ts"

export type EmailNotificationsSettingType = BaseSetting & {
    key: "EMAIL_NOTIFICATIONS",
    value: {
        enabled: boolean
    }
}
import { Result } from "src/domain/shared/types/Result.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import queues from "src/infrastructure/bull/queues/bootstrap.ts";

export async function startApplication(
    data: { jobPostingUUID: string, filePath: string, name: string, email: string, phoneNum?: string, website?: string }): Promise<Result<void, GenericError>> {
    try {
        await queues.ProcessJobApplication.add('ProcessJobApplication', data)
        return { ok: true, value: undefined }
    } catch (err) {
        if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_START_JOB_APPLICATION" }  }
        return { ok: false, error: { message: 'Unknown error', code: "ERR_START_JOB_APPLICATION" } }
    }

}
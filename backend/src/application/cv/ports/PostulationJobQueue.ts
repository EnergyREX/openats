import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Result } from "src/domain/shared/types/Result.ts";

export interface PostulationJobQueue {
    enqueuePostulation(data: unknown): Promise<Result<void, GenericError>>
}
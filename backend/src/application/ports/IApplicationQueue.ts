import { Result } from "src/domain/shared/types/Result.ts";

export interface IApplicationQueue {
    schedule(data: unknown, delay?: number): Promise<Result<void, never>>
}
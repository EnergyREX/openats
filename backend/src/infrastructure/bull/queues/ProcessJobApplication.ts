import { IApplicationQueue } from "src/application/ports/IApplicationQueue.ts";
import { queueProducer } from "../config/queueProducer.ts";
import { Ok, Result } from "src/domain/shared/types/Result.ts";

export const ProcessJobApplication = queueProducer('ProcessJobApplication');

export class ProcessJobApplicationQueue implements IApplicationQueue {
    async schedule(data: unknown, delay?: number): Promise<Result<void, never>> {
        ProcessJobApplication.add('ProcessJobApplication', data, { delay: delay })
        return Ok(undefined)
    }
}
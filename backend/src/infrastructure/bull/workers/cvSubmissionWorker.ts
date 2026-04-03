import { Job, Worker } from "bullmq";
import { candidateParse } from "src/application/cv/use-cases/candidateParse.ts";

const QUEUE_NAME = "cvSubmission";
const cvSubmissionWorker = new Worker(
    QUEUE_NAME, 
    async (job: Job) => {
        await candidateParse()
})
import { eq } from "drizzle-orm";
import db from "../../config/database.ts";
import { JobPosting } from "../../domain/offers/aggregates/JobPosting.ts";
import { deleteJobPostingError } from "../../domain/offers/errors/jobposting/deleteJobPosting.error.ts";
import { getJobPostingError } from "../../domain/offers/errors/jobposting/getJobPosting.error.ts";
import { saveJobPostingError } from "../../domain/offers/errors/jobposting/saveJobPosting.error.ts";
import { updateJobPostingError } from "../../domain/offers/errors/jobposting/updateJobPosting.error.ts";
import { JobPostingFactory } from "../../domain/offers/factories/JobPosting.factory.ts";
import { IJobPostingRepository } from "../../domain/offers/repositories/IJobPostingRepository.ts";
import { Result } from "../../domain/shared/types/Result.ts";
import { jobPostings } from "../drizzle/schema/jobPostings.ts";

export class JobPostingRepositoryImpl implements IJobPostingRepository {

    private mapRowToJobPosting(d: typeof jobPostings.$inferSelect) {
        return JobPostingFactory.create(
                d.uuid,
                d.title,
                d.body,
                {
                    name: d.recruiterName ?? undefined,
                    phoneNumber: d.recruiterPhone ?? undefined,
                    email: d.recruiterEmail ?? undefined,
                }
        )
    }

    async save(value: JobPosting): Promise<Result<string, saveJobPostingError>> {
        try {
            const [{ uuid }] = await db.insert(jobPostings).values({
                uuid: crypto.randomUUID(),
                title: value.getTitle(),
                body: value.getBody(),
                recruiterName: value.getContactDetails().getName(),
                recruiterEmail: value.getContactDetails().getEmail() ?? null,
                recruiterPhone: value.getContactDetails().getPhoneNumber() ?? null,
            }).returning({uuid: jobPostings.uuid})
            return { ok: true, value: uuid }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_JOB_POSTING_STORE" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_JOB_POSTING_STORE" } } 
        }
    }

    async getAll(): Promise<Result<JobPosting[], getJobPostingError>> {
        try {
            const rawData = await db.select().from(jobPostings)
            const data: JobPosting[] = rawData.map((d) => this.mapRowToJobPosting(d))
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_JOB_POSTING" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_GET_JOB_POSTING" } } 
        }
    }

    async getByUUID(uuid: string): Promise<Result<JobPosting, getJobPostingError>> {
        try {
            const [row] = await db.select().from(jobPostings).where(eq(jobPostings.uuid, uuid))
            
            if (!row) return { ok: false, error: { message: "Not found", code: "ERR_GET_JOB_POSTING" }} 
            //console.log(rawData)
            const data: JobPosting = this.mapRowToJobPosting(row)
            
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_JOB_POSTING" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_GET_JOB_POSTING" } } 
        }
    }

    async update(value: JobPosting): Promise<Result<void, updateJobPostingError>> {
        try {
            await db.update(jobPostings)
                .set({
                    title: value.getTitle(),
                    body: value.getBody(),
                    recruiterName: value.getContactDetails().getName(),
                    recruiterEmail: value.getContactDetails().getEmail() ?? null,
                    recruiterPhone: value.getContactDetails().getPhoneNumber() ?? null,
                })
                .where(eq(jobPostings.uuid, value.getUuid()))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_JOB_POSTING_UPDATE" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_JOB_POSTING_UPDATE" } } 
        }
    }

    async delete(uuid: string): Promise<Result<void, deleteJobPostingError>> {
        try {
            await db.delete(jobPostings).where(eq(jobPostings.uuid, uuid))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_DELETE_JOB_POSTING" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_DELETE_JOB_POSTING" } } 
        }
    }
}
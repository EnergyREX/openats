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

    async save(value: JobPosting): Promise<Result<void, saveJobPostingError>> {
        try {
            await db.insert(jobPostings).values({
                uuid: value.getUuid(),
                title: value.getTitle(),
                body: value.getBody(),
                recruiterName: value.getContactDetails().getName(),
                recruiterEmail: value.getContactDetails().getEmail() ?? null,
                recruiterPhone: value.getContactDetails().getPhoneNumber() ?? null,
            })
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_JOB_POSTING_STORE" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_JOB_POSTING_STORE" } }
            }
        }
    }

    async getAll(): Promise<Result<JobPosting[], getJobPostingError>> {
        try {
            const rawData = await db.select().from(jobPostings)
            const data: JobPosting[] = rawData.map(d =>
                JobPostingFactory.create(
                    d.uuid,
                    d.title,
                    d.body,
                    {
                        name: d.recruiterName ?? undefined,
                        phoneNumber: d.recruiterPhone ?? undefined,
                        email: d.recruiterEmail ?? undefined,
                    }
                )
            )
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_GET_JOB_POSTING" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_GET_JOB_POSTING" } }
            }
        }
    }

    async getByUUID(uuid: string): Promise<Result<JobPosting, getJobPostingError>> {
        try {
            const [raw] = await db.select().from(jobPostings).where(eq(jobPostings.uuid, uuid))
            if (!raw) return { ok: false, error: { message: "Not found", code: "ERR_GET_JOB_POSTING" } }

            const data = JobPostingFactory.create(
                raw.uuid,
                raw.title,
                raw.body,
                {
                    name: raw.recruiterName ?? undefined,
                    phoneNumber: raw.recruiterPhone ?? undefined,
                    email: raw.recruiterEmail ?? undefined,
                }
            )
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_GET_JOB_POSTING" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_GET_JOB_POSTING" } }
            }
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
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_JOB_POSTING_UPDATE" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_JOB_POSTING_UPDATE" } }
            }
        }
    }

    async delete(uuid: string): Promise<Result<void, deleteJobPostingError>> {
        try {
            await db.delete(jobPostings).where(eq(jobPostings.uuid, uuid))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_DELETE_JOB_POSTING" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_DELETE_JOB_POSTING" } }
            }
        }
    }
}
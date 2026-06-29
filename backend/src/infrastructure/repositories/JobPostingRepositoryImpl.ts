import { count, eq } from "drizzle-orm";
import db from "../../config/database.ts";
import { JobPosting } from "../../domain/offers/aggregates/JobPosting.ts";
import { deleteJobPostingError } from "../../domain/offers/errors/jobposting/deleteJobPosting.error.ts";
import { getJobPostingError } from "../../domain/offers/errors/jobposting/getJobPosting.error.ts";
import { saveJobPostingError } from "../../domain/offers/errors/jobposting/saveJobPosting.error.ts";
import { updateJobPostingError } from "../../domain/offers/errors/jobposting/updateJobPosting.error.ts";
import { JobPostingFactory } from "../../domain/offers/factories/JobPosting.factory.ts";
import { OfferPipeline } from "../../domain/offers/value-objects/OfferPipeline.ts";
import { IJobPostingRepository } from "../../domain/offers/repositories/IJobPostingRepository.ts";
import { Err, Ok, Result } from "../../domain/shared/types/Result.ts";
import { toError } from "../../domain/shared/helpers/ToError.ts";
import { jobPostings } from "../drizzle/schema/jobPostings.ts";

export class JobPostingRepositoryImpl implements IJobPostingRepository {

    private mapRowToJobPosting(d: typeof jobPostings.$inferSelect) {
        return JobPostingFactory.create(
                d.uuid,
                d.ownerUuid,
                d.title,
                d.body,
                OfferPipeline.default(),
                (d.recruiterContact ?? {}) as { phoneNumber?: string; address?: string; email?: string },
                (d.company ?? {}) as { name: string; size: string; website: string; industry: string },
                (d.location ?? {}) as { city: string; country: string; modality: string },
                (d.salary ?? {}) as { min: number; max: number; currency: string; period: string; equity: boolean },
                new Set((d.requirements as string[] | null) ?? [])
        )
    }

    private mapJobPostingToRow(value: JobPosting) {
        const contact = value.getContactDetails()
        const company = value.getCompany()
        const location = value.getLocation()
        const salary = value.getSalary()

        return {
            ownerUuid: value.getOwnerUuid().toPrimitive(),
            title: value.getTitle(),
            body: value.getBody(),
            recruiterContact: contact.toJson(),
            company: {
                name: company.getName(),
                size: company.getSize(),
                website: company.getWebsite(),
                industry: company.getIndustry(),
            },
            location: {
                city: location.getCity(),
                country: location.getCountry(),
                modality: location.getModality(),
            },
            salary: {
                min: salary.getMinSalary(),
                max: salary.getMaxSalary(),
                currency: salary.getCurrency(),
                period: salary.getPeriod(),
                equity: salary.hasEquity(),
            },
            requirements: [...value.getRequirements()],
        }
    }

    async save(value: JobPosting): Promise<Result<string, saveJobPostingError>> {
        try {
            const [{ uuid }] = await db.insert(jobPostings).values({
                uuid: crypto.randomUUID(),
                ...this.mapJobPostingToRow(value),
            }).returning({uuid: jobPostings.uuid})
            return Ok(uuid)
        } catch (err) {
            return Err(toError(err, 'ERR_JOB_POSTING_STORE'))
        }
    }

    async getAll(): Promise<Result<JobPosting[], getJobPostingError>> {
        try {
            const rawData = await db.select().from(jobPostings)
            const data: JobPosting[] = rawData.map((d) => this.mapRowToJobPosting(d))
            return Ok(data)
        } catch (err) {
            return Err(toError(err, 'ERR_GET_JOB_POSTING'))
        }
    }

    async getByUUID(uuid: string): Promise<Result<JobPosting, getJobPostingError>> {
        try {
            const [row] = await db.select().from(jobPostings).where(eq(jobPostings.uuid, uuid))

            if (!row) return Err({ message: "Not found", code: "ERR_GET_JOB_POSTING" })

            const data: JobPosting = this.mapRowToJobPosting(row)

            return Ok(data)
        } catch (err) {
            return Err(toError(err, 'ERR_GET_JOB_POSTING'))
        }
    }

    async count(): Promise<number> {
        const [{ value }] = await db.select({ value: count() }).from(jobPostings)
        return value
    }

    async update(value: JobPosting): Promise<Result<void, updateJobPostingError>> {
        try {
            await db.update(jobPostings)
                .set(this.mapJobPostingToRow(value))
                .where(eq(jobPostings.uuid, value.getUuid().toPrimitive()))
            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_JOB_POSTING_UPDATE'))
        }
    }

    async delete(uuid: string): Promise<Result<void, deleteJobPostingError>> {
        try {
            await db.delete(jobPostings).where(eq(jobPostings.uuid, uuid))
            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_DELETE_JOB_POSTING'))
        }
    }
}

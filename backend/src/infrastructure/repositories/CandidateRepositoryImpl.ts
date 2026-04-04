import { eq } from "drizzle-orm";
import db from "../../config/database.ts";
import { Candidate } from "../../domain/offers/aggregates/Candidate.ts";
import { deleteCandidateError } from "../../domain/offers/errors/candidate/deleteCandidate.error.ts";
import { getCandidateError } from "../../domain/offers/errors/candidate/getCandidate.error.ts";
import { saveCandidateError } from "../../domain/offers/errors/candidate/saveCandidate.error.ts";
import { updateCandidateError } from "../../domain/offers/errors/candidate/updateCandidate.error.ts";
import { CandidateFactory } from "../../domain/offers/factories/Candidate.factory.ts";
import { ICandidateRepository } from "../../domain/offers/repositories/ICandidateRepository.ts";
import { Result } from "../../domain/shared/types/Result.ts";
import { candidates } from "../drizzle/schema/candidates.ts";
import { applications } from "../drizzle/schema/applications.ts";

export class CandidateRepositoryImpl implements ICandidateRepository {

    async save(value: Candidate): Promise<Result<void, saveCandidateError>> {
        try {
            await db.insert(candidates).values({
                uuid: value.getUuid(),
                name: value.getName(),
                title: value.getTitle(),
                about: value.getAbout(),
                skills: value.getSkills(),
                email: value.getContactDetails().getEmail() ?? null,
                phone: value.getContactDetails().getPhoneNumber() ?? null,
                address: value.getContactDetails().getAddress() ?? null,
            })
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_CANDIDATE_STORE" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_CANDIDATE_STORE" } }
            }
        }
    }

    async getAll(): Promise<Result<Candidate[], getCandidateError>> {
        try {
            const rawData = await db.select().from(candidates)
            const data: Candidate[] = rawData.map(d =>
                CandidateFactory.create(
                    d.uuid,
                    d.name,
                    d.title,
                    d.about,
                    d.skills,
                    {
                        phoneNumber: d.phone ?? undefined,
                        address: d.address ?? undefined,
                        email: d.email ?? undefined,
                    }
                )
            )
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_GET_CANDIDATE" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_GET_CANDIDATE" } }
            }
        }
    }

    async getByUUID(uuid: string): Promise<Result<Candidate, getCandidateError>> {
        try {
            const [raw] = await db.select().from(candidates).where(eq(candidates.uuid, uuid))
            if (!raw) return { ok: false, error: { message: "Not found", code: "ERR_GET_CANDIDATE" } }

            const data = CandidateFactory.create(
                raw.uuid,
                raw.name,
                raw.title,
                raw.about,
                raw.skills,
                {
                    phoneNumber: raw.phone ?? undefined,
                    address: raw.address ?? undefined,
                    email: raw.email ?? undefined,
                }
            )
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_GET_CANDIDATE" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_GET_CANDIDATE" } }
            }
        }
    }

    async getInOffer(offerUuid: string): Promise<Result<Candidate[], getCandidateError>> {
        try {
            const rawData = await db.select({
                uuid: candidates.uuid,
                name: candidates.name,
                title: candidates.title,
                about: candidates.about,
                skills: candidates.skills,
                phone: candidates.phone,
                address: candidates.address,
                email: candidates.email,
            })
            .from(candidates)
            .innerJoin(applications, eq(applications.candidateUuid, candidates.uuid))
            .where(eq(applications.offerUuid, offerUuid))

            const data: Candidate[] = rawData.map(d =>
                CandidateFactory.create(
                    d.uuid,
                    d.name,
                    d.title,
                    d.about,
                    d.skills,
                    {
                        phoneNumber: d.phone ?? undefined,
                        address: d.address ?? undefined,
                        email: d.email ?? undefined,
                    }
                )
            )
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_GET_CANDIDATE" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_GET_CANDIDATE" } }
            }
        }
    }

    async update(value: Candidate): Promise<Result<void, updateCandidateError>> {
        try {
            await db.update(candidates)
                .set({
                    name: value.getName(),
                    title: value.getTitle(),
                    about: value.getAbout(),
                    skills: value.getSkills(),
                    email: value.getContactDetails().getEmail() ?? null,
                    phone: value.getContactDetails().getPhoneNumber() ?? null,
                    address: value.getContactDetails().getAddress() ?? null,
                })
                .where(eq(candidates.uuid, value.getUuid()))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_JOB_CANDIDATE_UPDATE" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_JOB_CANDIDATE_UPDATE" } }
            }
        }
    }

    async delete(uuid: string): Promise<Result<void, deleteCandidateError>> {
        try {
            await db.delete(candidates).where(eq(candidates.uuid, uuid))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_DELETE_CANDIDATE" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_DELETE_CANDIDATE" } }
            }
        }
    }
}
import { eq } from "drizzle-orm";
import db from "../../config/database.ts";
import { Candidate, CandidateCertification, CandidateEducation, CandidateLanguage, CandidateProject, WorkExperience } from "../../domain/offers/aggregates/Candidate.ts";
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

    private mapRowToCandidate(d: typeof candidates.$inferSelect): Candidate {
        return CandidateFactory.create(
            d.uuid,
            d.name,
            d.title,
            d.about,
            {
                phoneNumber: d.phone ?? undefined,
                address: d.address ?? undefined,
                email: d.email ?? undefined,
                website: d.website ?? undefined,
                github: d.github ?? undefined,
                linkedin: d.linkedin ?? undefined,
            },
            d.skills,
            d.cvUrl ?? "",
            d.experience as WorkExperience[] | undefined,
            d.projects as CandidateProject[] | undefined,
            d.education as CandidateEducation[] | undefined,
            d.certifications as CandidateCertification[] | undefined,
            d.languages as CandidateLanguage[] | undefined,
            d.volunteering ?? undefined,
            d.additionalInfo ?? undefined
        )
    }

    async save(value: Candidate): Promise<Result<string, saveCandidateError>> {
        try {
            const [{ uuid }] = await db.insert(candidates).values({
                uuid: crypto.randomUUID(),
                name: value.getName(),
                title: value.getTitle(),
                about: value.getAbout(),
                skills: value.getSkills(),
                email: value.getContactDetails().getEmail() ?? null,
                phone: value.getContactDetails().getPhoneNumber() ?? null,
                address: value.getContactDetails().getAddress() ?? null,
                website: value.getContactDetails().getWebsite() ?? null,
                github: value.getContactDetails().getGithub() ?? null,
                linkedin: value.getContactDetails().getLinkedin() ?? null,
                experience: value.getExperience() ?? null,
                projects: value.getProjects() ?? null,
                education: value.getEducation() ?? null,
                certifications: value.getCertifications() ?? null,
                languages: value.getLanguages() ?? null,
                volunteering: value.getVolunteering() ?? null,
                additionalInfo: value.getAdditionalInfo() ?? null,
                cvUrl: value.getCvPath() ?? null,
            }).returning({ uuid: candidates.uuid })

            return { ok: true, value: uuid }
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
            const data: Candidate[] = rawData.map((d) => this.mapRowToCandidate(d))
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
            return { ok: true, value: this.mapRowToCandidate(raw) }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_CANDIDATE" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_GET_CANDIDATE" } } 
        }
    }

    async getByEmail(email: string): Promise<Result<Candidate, getCandidateError>> {
        try {
            const [raw] = await db.select().from(candidates).where(eq(candidates.email, email))
            if (!raw) return { ok: false, error: { message: "Not found", code: "ERR_GET_CANDIDATE" } }
            return { ok: true, value: this.mapRowToCandidate(raw) }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_CANDIDATE" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_GET_CANDIDATE" } } 
        }
    }

    async getInOffer(offerUuid: string): Promise<Result<Candidate[], getCandidateError>> {
        try {
            const rawData = await db.select()
                .from(candidates)
                .innerJoin(applications, eq(applications.candidateUuid, candidates.uuid))
                .where(eq(applications.offerUuid, offerUuid))

            return { ok: true, value: rawData.map(r => this.mapRowToCandidate(r.candidates)) }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_CANDIDATE" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_GET_CANDIDATE" } } 
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
                    website: value.getContactDetails().getWebsite() ?? null,
                    github: value.getContactDetails().getGithub() ?? null,
                    linkedin: value.getContactDetails().getLinkedin() ?? null,
                    experience: value.getExperience() ?? null,
                    projects: value.getProjects() ?? null,
                    education: value.getEducation() ?? null,
                    certifications: value.getCertifications() ?? null,
                    languages: value.getLanguages() ?? null,
                    volunteering: value.getVolunteering() ?? null,
                    additionalInfo: value.getAdditionalInfo() ?? null,
                })
                .where(eq(candidates.uuid, value.getUuid()))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_JOB_CANDIDATE_UPDATE" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_JOB_CANDIDATE_UPDATE" } } 
        }
    }

    async delete(uuid: string): Promise<Result<void, deleteCandidateError>> {
        try {
            await db.delete(candidates).where(eq(candidates.uuid, uuid))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_DELETE_CANDIDATE" } }
            return { ok: false, error: { message: "Unknown error", code: "ERR_DELETE_CANDIDATE" } } 
        }
    }
}

import { count, eq } from "drizzle-orm";
import db from "../../config/database.ts";
import { Candidate, CandidateCertification, CandidateEducation, CandidateLanguage, CandidateProject, WorkExperience } from "../../domain/offers/aggregates/Candidate.ts";
import { deleteCandidateError } from "../../domain/offers/errors/candidate/deleteCandidate.error.ts";
import { getCandidateError } from "../../domain/offers/errors/candidate/getCandidate.error.ts";
import { saveCandidateError } from "../../domain/offers/errors/candidate/saveCandidate.error.ts";
import { updateCandidateError } from "../../domain/offers/errors/candidate/updateCandidate.error.ts";
import { CandidateFactory } from "../../domain/offers/factories/Candidate.factory.ts";
import { ICandidateRepository } from "../../domain/offers/repositories/ICandidateRepository.ts";
import { Err, Ok, Result } from "../../domain/shared/types/Result.ts";
import { toError } from "../../domain/shared/helpers/ToError.ts";
import { candidates } from "../drizzle/schema/candidates.ts";
import { candidacies } from "../drizzle/schema/candidacies.ts";
import { CandidateVolunteering } from "src/domain/offers/types/CandidateVolunteering.js";
import { CandidateAdditionalInfo } from "src/domain/offers/types/CandidateAdditionalInfo.js";
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
                linkedin: d.linkedin ?? undefined
            },
            d.skills,
            d.cvUrl ?? "",
            d.experience as WorkExperience[] | undefined,
            d.projects as CandidateProject[] | undefined,
            d.education as CandidateEducation[] | undefined,
            d.certifications as CandidateCertification[] | undefined,
            d.languages as CandidateLanguage[] | undefined,
            d.volunteering as CandidateVolunteering | undefined,
            d.additionalInfo as CandidateAdditionalInfo | undefined
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

            return Ok(uuid)
        } catch (err) {
            return Err(toError(err, 'ERR_CANDIDATE_STORE'))
        }
    }

    async getAll(): Promise<Result<Candidate[], getCandidateError>> {
        try {
            const rawData = await db.select().from(candidates)
            const data: Candidate[] = rawData.map((d) => this.mapRowToCandidate(d))
            return Ok(data)
        } catch (err) {
            return Err(toError(err, 'ERR_GET_CANDIDATE'))
        }
    }

    async getByUUID(uuid: string): Promise<Result<Candidate, getCandidateError>> {
        try {
            const [raw] = await db.select().from(candidates).where(eq(candidates.uuid, uuid))
            if (!raw) return Err({ message: "Not found", code: "ERR_GET_CANDIDATE" })
            return Ok(this.mapRowToCandidate(raw))
        } catch (err) {
            return Err(toError(err, 'ERR_GET_CANDIDATE'))
        }
    }

    async getByEmail(email: string): Promise<Result<Candidate, getCandidateError>> {
        try {
            const [raw] = await db.select().from(candidates).where(eq(candidates.email, email))
            if (!raw) return Err({ message: "Not found", code: "ERR_GET_CANDIDATE" })
            return Ok(this.mapRowToCandidate(raw))
        } catch (err) {
            return Err(toError(err, 'ERR_GET_CANDIDATE'))
        }
    }

    async getInOffer(offerUuid: string): Promise<Result<Candidate[], getCandidateError>> {
        try {
            const rawData = await db.select()
                .from(candidates)
                .innerJoin(candidacies, eq(candidacies.candidateUuid, candidates.uuid))
                .where(eq(candidacies.offerUuid, offerUuid))

            return Ok(rawData.map(r => this.mapRowToCandidate(r.candidates)))
        } catch (err) {
            return Err(toError(err, 'ERR_GET_CANDIDATE'))
        }
    }

    async count(): Promise<number> {
        const [{ value }] = await db.select({ value: count() }).from(candidates)
        return value
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
            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_CANDIDATE_UPDATE'))
        }
    }

    async delete(uuid: string): Promise<Result<void, deleteCandidateError>> {
        try {
            await db.delete(candidates).where(eq(candidates.uuid, uuid))
            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_DELETE_CANDIDATE'))
        }
    }
}

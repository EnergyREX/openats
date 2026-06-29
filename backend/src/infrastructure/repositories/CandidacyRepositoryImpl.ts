import { and, count, eq } from "drizzle-orm";
import db from "../../config/database.ts";
import { Candidacy } from "../../domain/offers/aggregates/Candidacy.ts";
import { CandidacyStatus } from "../../domain/offers/value-objects/CandidacyStatus.ts";
import { deleteCandidacyError } from "../../domain/offers/errors/candidacy/deleteCandidacy.error.ts";
import { getCandidacyError } from "../../domain/offers/errors/candidacy/getCandidacy.error.ts";
import { saveCandidacyError } from "../../domain/offers/errors/candidacy/saveCandidacy.error.ts";
import { updateCandidacyError } from "../../domain/offers/errors/candidacy/updateCandidacy.error.ts";
import { ICandidacyRepository } from "../../domain/offers/repositories/ICandidacyRepository.ts";
import { Err, Ok, Result } from "../../domain/shared/types/Result.ts";
import { toError } from "../../domain/shared/helpers/ToError.ts";
import { candidacies } from "../drizzle/schema/candidacies.ts";

export class CandidacyRepositoryImpl implements ICandidacyRepository {

    private mapRow(d: typeof candidacies.$inferSelect): Candidacy {
        return Candidacy.reconstitute(
            d.uuid, d.offerUuid, d.candidateUuid,
            d.status as CandidacyStatus, d.currentPhaseOrder, d.score, d.annotations,
            d.rejectReason, d.createdAt, d.updatedAt,
        )
    }

    async save(value: Candidacy): Promise<Result<string, saveCandidacyError>> {
        try {
            const [{ uuid }] = await db.insert(candidacies).values({
                uuid: value.getUuid().toPrimitive(),
                offerUuid: value.getOfferUuid().toPrimitive(),
                candidateUuid: value.getCandidateUuid().toPrimitive(),
                status: value.getStatus(),
                currentPhaseOrder: value.getCurrentPhaseOrder(),
                score: value.getScore() ?? -1,
                annotations: value.getAnnotations(),
                rejectReason: value.getRejectionReason(),
                createdAt: value.getCreationDate(),
                updatedAt: value.getLastUpdateDate(),
            }).returning({ uuid: candidacies.uuid })

            return Ok(uuid)
        } catch (err) {
            return Err(toError(err, 'ERR_SAVE_CANDIDACY'))
        }
    }

    async getAll(): Promise<Result<Candidacy[], getCandidacyError>> {
        try {
            const rawData = await db.select().from(candidacies)
            const data: Candidacy[] = rawData.map(d => this.mapRow(d))
            return Ok(data)
        } catch (err) {
            return Err(toError(err, 'ERR_GET_CANDIDACY'))
        }
    }

    async getByUUID(uuid: string): Promise<Result<Candidacy, getCandidacyError>> {
        try {
            const [raw] = await db.select().from(candidacies).where(eq(candidacies.uuid, uuid))
            if (!raw) return Err({ message: "Not found", code: "ERR_GET_CANDIDACY" })

            return Ok(this.mapRow(raw))
        } catch (err) {
            return Err(toError(err, 'ERR_GET_CANDIDACY'))
        }
    }

    async getByCandidateUUID(uuid: string): Promise<Result<Candidacy, getCandidacyError>> {
        try {
            const [raw] = await db.select().from(candidacies).where(eq(candidacies.candidateUuid, uuid))
            if (!raw) return Err({ message: 'Not found', code: "ERR_GET_CANDIDACY" })

            return Ok(this.mapRow(raw))
        } catch (err) {
            return Err(toError(err, 'ERR_GET_CANDIDACY'))
        }
    }

    async getByCandidateAndOfferUUID(candidate: string, offer: string): Promise<Result<Candidacy, getCandidacyError>> {
        try {
            const [raw] = await db.select().from(candidacies)
                .where(and(eq(candidacies.candidateUuid, candidate), eq(candidacies.offerUuid, offer)))
            if (!raw) return Err({ message: 'Not found', code: "ERR_GET_CANDIDACY" })

            return Ok(this.mapRow(raw))
        } catch (err) {
            return Err(toError(err, 'ERR_GET_CANDIDACY'))
        }
    }

    async getByOffer(offerUuid: string): Promise<Result<Candidacy[], getCandidacyError>> {
        try {
            const rawData = await db.select().from(candidacies).where(eq(candidacies.offerUuid, offerUuid))
            const data: Candidacy[] = rawData.map(d => this.mapRow(d))
            return Ok(data)
        } catch (err) {
            return Err(toError(err, 'ERR_GET_CANDIDACY'))
        }
    }

    async count(): Promise<number> {
        const [{ value }] = await db.select({ value: count() }).from(candidacies)
        return value
    }

    // pendingReview = candidaturas aún sin evaluar (score por defecto -1, ver §6)
    async countPendingReview(): Promise<number> {
        const [{ value }] = await db.select({ value: count() }).from(candidacies).where(eq(candidacies.score, -1))
        return value
    }

    async update(value: Candidacy): Promise<Result<void, updateCandidacyError>> {
        try {
            await db.update(candidacies)
                .set({
                    status: value.getStatus(),
                    currentPhaseOrder: value.getCurrentPhaseOrder(),
                    score: value.getScore() ?? -1,
                    annotations: value.getAnnotations(),
                    rejectReason: value.getRejectionReason(),
                    updatedAt: value.getLastUpdateDate(),
                })
                .where(eq(candidacies.uuid, value.getUuid().toPrimitive()))
            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_UPDATE_CANDIDACY'))
        }
    }

    async delete(uuid: string): Promise<Result<void, deleteCandidacyError>> {
        try {
            await db.delete(candidacies).where(eq(candidacies.uuid, uuid))
            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_DELETE_CANDIDACY'))
        }
    }
}

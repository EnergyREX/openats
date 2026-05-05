import { and, eq } from "drizzle-orm";
import db from "../../config/database.ts";
import { Application } from "../../domain/offers/aggregates/Application.ts";
import { deleteApplicationError } from "../../domain/offers/errors/application/deleteApplication.error.ts";
import { getApplicationError } from "../../domain/offers/errors/application/getApplication.error.ts";
import { saveApplicationError } from "../../domain/offers/errors/application/saveApplication.error.ts";
import { updateApplicationError } from "../../domain/offers/errors/application/updateApplication.error.ts";
import { ApplicationFactory } from "../../domain/offers/factories/Application.factory.ts";
import { IApplicationRepository } from "../../domain/offers/repositories/IApplicationRepository.ts";
import { Result } from "../../domain/shared/types/Result.ts";
import { applications } from "../drizzle/schema/applications.ts";

export class ApplicationRepositoryImpl implements IApplicationRepository {

    private mapRowApplication(d: typeof applications.$inferSelect): Application {
        return ApplicationFactory.create(
            d.uuid,
            d.offerUuid,
            d.candidateUuid,
            d.annotations ?? [],
            (d.suggestedStatus as "discarded" | "interview" | "review") ?? "review",
            d.score ?? undefined,
            d.discarded ?? undefined,
            d.discardReason ?? undefined
        )
    }

    async save(value: Application): Promise<Result<string, saveApplicationError>> {
        try {
            // console.log('[save] annotations:', JSON.stringify(value.getAnnotations()))
            const [{ uuid }] = await db.insert(applications).values({
                uuid: crypto.randomUUID(),
                offerUuid: value.getOfferUuid(),
                candidateUuid: value.getCandidateUuid(),
                score: value.getScore() ?? null,
                annotations: value.getAnnotations(),
                discarded: value.getIsDiscarded() ?? false,
                suggestedStatus: value.getSuggestedStatus(),
                discardReason: value.getDiscardReason() ?? "",
            }).returning({ uuid: applications.uuid })

            return { ok: true, value: uuid }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_SAVE_APPLICATION" } }
            return { ok: false, error: { message: 'Unknown error', code: "ERR_SAVE_APPLICATION" } }
        }
    }

    async getAll(): Promise<Result<Application[], getApplicationError>> {
        try {
            const rawData = await db.select().from(applications)
            const data: Application[] = rawData.map(d => this.mapRowApplication(d))
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_APPLICATION" } }
            return { ok: false, error: { message: 'Unknown error', code: "ERR_GET_APPLICATION" } }
        }
    }

    async getByUUID(uuid: string): Promise<Result<Application, getApplicationError>> {
        try {
            const [raw] = await db.select().from(applications).where(eq(applications.uuid, uuid))
            if (!raw) return { ok: false, error: { message: "Not found", code: "ERR_GET_APPLICATION" } }

            const data: Application = this.mapRowApplication(raw)

            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_APPLICATION" } }
            return { ok: false, error: { message: 'Unknown error', code: "ERR_GET_APPLICATION" } }
        }
    }

    async getByCandidateUUID(uuid: string): Promise<Result<Application, getApplicationError>> {
        try {
            const [ raw ] = await db.select().from(applications).where(eq(applications.candidateUuid, uuid))
            if (!raw) return { ok: false, error: { message: 'Not found', code: "ERR_GET_APPLICATION" } }
            const data = this.mapRowApplication(raw)
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_APPLICATION" } }
            return { ok: false, error: { message: 'Unknown error', code: "ERR_GET_APPLICATION" } }
        }
    }

    async getByCandidateAndOfferUUID(candidate: string, offer: string): Promise<Result<Application, getApplicationError>> {
        try {
            const [ raw ] = await db.select().from(applications).where(and(eq(applications.candidateUuid, candidate), eq(applications.offerUuid, offer)))
            if (!raw) return { ok: false, error: { message: 'Not found', code: "ERR_GET_APPLICATION" } }
            const data = this.mapRowApplication(raw)
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_APPLICATION" } }
            return { ok: false, error: { message: 'Unknown error', code: "ERR_GET_APPLICATION" } }
        }
    }

    async getByOffer(offerUuid: string): Promise<Result<Application[], getApplicationError>> {
        try {
            const rawData = await db.select().from(applications).where(eq(applications.offerUuid, offerUuid))
            const data: Application[] = rawData.map(d => this.mapRowApplication(d))
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_GET_APPLICATION" } }
            return { ok: false, error: { message: 'Unknown error', code: "ERR_GET_APPLICATION" } }
        }
    }

    async update(value: Application): Promise<Result<void, updateApplicationError>> {
        try {
            await db.update(applications)
                .set({
                    score: value.getScore() ?? null,
                    annotations: value.getAnnotations(),
                    discarded: value.getIsDiscarded() ?? null,
                })
                .where(eq(applications.uuid, value.getUuid()))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_UPDATE_APPLICATION" } }
            return { ok: false, error: { message: 'Unknown error', code: "ERR_UPDATE_APPLICATION" } }
        }
    }

    async delete(uuid: string): Promise<Result<void, deleteApplicationError>> {
        try {
            await db.delete(applications).where(eq(applications.uuid, uuid))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) return { ok: false, error: { message: err.message, code: "ERR_DELETE_APPLICATION" } }
            return { ok: false, error: { message: 'Unknown error', code: "ERR_DELETE_APPLICATION" } }
        }
    }
}
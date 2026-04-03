import { eq } from "drizzle-orm";
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

    async save(value: Application): Promise<Result<void, saveApplicationError>> {
        try {
            await db.insert(applications).values({
                uuid: value.getUuid(),
                offerUuid: value.getOfferUuid(),
                candidateUuid: value.getCandidateUuid(),
                score: value.getScore() ?? null,
                annotations: value.getAnnotations(),
                isValid: value.getIsValid() ?? null,
            })
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_SAVE_APPLICATION" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_SAVE_APPLICATION" } }
            }
        }
    }

    async getAll(): Promise<Result<Application[], getApplicationError>> {
        try {
            const rawData = await db.select().from(applications)
            const data: Application[] = rawData.map(d =>
                ApplicationFactory.create(
                    d.uuid,
                    d.offerUuid,
                    d.candidateUuid,
                    d.score ?? undefined,
                    d.annotations ?? undefined,
                    d.isValid ?? undefined,
                )
            )
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_GET_APPLICATION" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_GET_APPLICATION" } }
            }
        }
    }

    async getSingle(uuid: string): Promise<Result<Application, getApplicationError>> {
        try {
            const [raw] = await db.select().from(applications).where(eq(applications.uuid, uuid))
            if (!raw) return { ok: false, error: { message: "Not found", code: "ERR_GET_APPLICATION" } }

            const data = ApplicationFactory.create(
                raw.uuid,
                raw.offerUuid,
                raw.candidateUuid,
                raw.score ?? undefined,
                raw.annotations ?? undefined,
                raw.isValid ?? undefined,
            )
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_GET_APPLICATION" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_GET_APPLICATION" } }
            }
        }
    }

    async getByOffer(offerUuid: string): Promise<Result<Application[], getApplicationError>> {
        try {
            const rawData = await db.select().from(applications).where(eq(applications.offerUuid, offerUuid))
            const data: Application[] = rawData.map(d =>
                ApplicationFactory.create(
                    d.uuid,
                    d.offerUuid,
                    d.candidateUuid,
                    d.score ?? undefined,
                    d.annotations ?? undefined,
                    d.isValid ?? undefined,
                )
            )
            return { ok: true, value: data }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_GET_APPLICATION" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_GET_APPLICATION" } }
            }
        }
    }

    async update(value: Application): Promise<Result<void, updateApplicationError>> {
        try {
            await db.update(applications)
                .set({
                    score: value.getScore() ?? null,
                    annotations: value.getAnnotations(),
                    isValid: value.getIsValid() ?? null,
                })
                .where(eq(applications.uuid, value.getUuid()))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_UPDATE_APPLICATION" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_UPDATE_APPLICATION" } }
            }
        }
    }

    async delete(uuid: string): Promise<Result<void, deleteApplicationError>> {
        try {
            await db.delete(applications).where(eq(applications.uuid, uuid))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_DELETE_APPLICATION" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_DELETE_APPLICATION" } }
            }
        }
    }
}
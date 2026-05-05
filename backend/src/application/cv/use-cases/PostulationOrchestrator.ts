import { IPromptService } from "src/domain/shared/ports/IPromptService.ts";
import { candidateParse } from "./candidateParse.ts";
import { createApplication } from "./createApplication.ts";
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { IApplicationRepository } from "src/domain/offers/repositories/IApplicationRepository.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Result } from "src/domain/shared/types/Result.ts";
import { IAIClient } from "src/domain/shared/ports/IAIClient.ts";
import { postulationData } from "../types/postulationData.js";

export class PostulationOrchestrator {
    constructor (
        private vlm: IAIClient,
        private llm: IAIClient, 
        private promptService: IPromptService,
        private candidateRepository: ICandidateRepository,
        private jobPostingRepository: IJobPostingRepository,
        private applicationRepository: IApplicationRepository
    ) {}

    async exec(data: postulationData): Promise<Result<void, GenericError>> {
        const offer = await this.jobPostingRepository.getByUUID(data.jobPostingUUID)
        
        if (!offer.ok) return { ok: false, error: { message: "This offer doesn't exist!", code: "ERR_NO_OFFER" }}

        const candidate = await this.candidateRepository.getByEmail(data.email)
        let candidateData;

        if (!candidate.ok) {
            candidateData = await candidateParse(data.filePath, this.vlm, this.candidateRepository, 
                            { name: data.name, email: data.email, phoneNum: data.phoneNum, website: data.website })
        } else {
            candidateData = candidate
        }

        if (!candidateData.ok) return { ok: false, error: { message: candidateData.error!.message, code: candidateData.error!.code } }

        const application = await this.applicationRepository.getByCandidateAndOfferUUID(candidateData.value!.getUuid(), data.jobPostingUUID)

        if (application.ok) return { ok: true, value: undefined }

        return createApplication(
        candidateData.value!.getUuid(), data.jobPostingUUID,
        this.candidateRepository,
        this.jobPostingRepository,
        this.applicationRepository,
        this.llm, this.promptService)

    }
}
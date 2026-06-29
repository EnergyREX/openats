import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Result, Ok, Err } from "src/domain/shared/types/Result.ts";
import { IAIClient } from "src/domain/shared/ports/IAIClient.ts";

import { IPromptService } from "src/domain/shared/ports/IPromptService.ts";
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";

import { candidateParse } from "./candidateParse.ts";
import { createApplication } from "./createCandidacy.ts";

import { postulationData } from "../../types/postulationData.js";
import { ICandidacyRepository } from "src/domain/offers/repositories/ICandidacyRepository.ts";

export class PostulationOrchestrator {
    constructor (
        private vlm: IAIClient,
        private llm: IAIClient, 
        private promptService: IPromptService,
        private candidateRepository: ICandidateRepository,
        private jobPostingRepository: IJobPostingRepository,
        private candidacyRepository: ICandidacyRepository
    ) {}

    async exec(data: postulationData): Promise<Result<void, GenericError>> {
        // Try to get jobPosting
        const offer = await this.jobPostingRepository.getByUUID(data.jobPostingUUID)
        if (!offer.ok) return Err(offer.error)

        // Try to find the candidate
        const candidate = await this.candidateRepository.getByEmail(data.email)
        let candidateData;

        // If not exists, then create a new candidate and try to parse it
        if (!candidate.ok) {
            candidateData = await candidateParse(data.filePath, this.vlm, this.candidateRepository, 
                            { name: data.name, email: data.email, phoneNum: data.phoneNum, website: data.website })
        } else {
            candidateData = candidate
        }

        if (!candidateData.ok) return Err(candidateData.error)

        // Check if the application exists
        const candidacy = await this.candidacyRepository.getByCandidateAndOfferUUID(candidateData.value!.getUuid(), data.jobPostingUUID)

        // If exists, end process
        if (candidacy.ok) return Ok(undefined)

        // Else, create a new one
        return createApplication(
        candidateData.value!.getUuid(), data.jobPostingUUID,
        this.candidateRepository,
        this.jobPostingRepository,
        this.candidacyRepository,
        this.llm, this.promptService)

    }
}
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { StatsReturnType } from "./types/StatsReturnType.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { ICandidacyRepository } from "src/domain/offers/repositories/ICandidacyRepository.ts";
import { toError } from "src/domain/shared/helpers/ToError.ts";

export class DashboardStats {
    constructor(
        private readonly jobsRepo: IJobPostingRepository,
        private readonly candidatesRepo: ICandidateRepository,
        private readonly candidaciesRepo: ICandidacyRepository
    ) {}

    async exec(): Promise<Result<StatsReturnType, GenericError>> {
        try {
            const [totalJobs, totalCandidates, totalApplications, pendingReview] = await Promise.all([
                this.jobsRepo.count(),
                this.candidatesRepo.count(),
                this.candidaciesRepo.count(),
                this.candidaciesRepo.countPendingReview(),
            ])

            const data: StatsReturnType = { totalJobs, totalCandidates, totalApplications, pendingReview }
            return Ok(data)
        } catch (err) {
            return Err(toError(err, 'ERR_DASHBOARD_STATS'))
        }
    }
}

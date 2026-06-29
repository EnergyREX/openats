import { DashboardStats } from "src/application/dashboard/stats.ts";
import { JobPostingRepositoryImpl } from "src/infrastructure/repositories/JobPostingRepositoryImpl.ts";
import { CandidateRepositoryImpl } from "src/infrastructure/repositories/CandidateRepositoryImpl.ts";
import { CandidacyRepositoryImpl } from "src/infrastructure/repositories/CandidacyRepositoryImpl.ts";

const jobPostingRepository = new JobPostingRepositoryImpl()
const candidateRepository = new CandidateRepositoryImpl()
const candidacyRepository = new CandidacyRepositoryImpl()

const dashboardStats = new DashboardStats(jobPostingRepository, candidateRepository, candidacyRepository)

export const dashboardContainer = {
    stats: () => dashboardStats.exec()
}

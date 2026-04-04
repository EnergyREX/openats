import { Result } from '../../shared/types/Result.ts'
import { JobPosting } from "../aggregates/JobPosting.ts";
import { deleteJobPostingError } from '../errors/jobposting/deleteJobPosting.error.ts';
import { getJobPostingError } from '../errors/jobposting/getJobPosting.error.ts';
import { saveJobPostingError } from '../errors/jobposting/saveJobPosting.error.ts';
import { updateJobPostingError } from '../errors/jobposting/updateJobPosting.error.ts';

export interface IJobPostingRepository {
    save(value: JobPosting): Promise<Result<void, saveJobPostingError>>;

    getAll(): Promise<Result<JobPosting[], getJobPostingError>>
    getByUUID(uuid: string): Promise<Result<JobPosting, getJobPostingError>>

    update(value: JobPosting): Promise<Result<void, updateJobPostingError>>
    delete(uuid: string): Promise<Result<void, deleteJobPostingError>>
}
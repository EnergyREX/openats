import { Result } from '../../shared/types/Result.ts'
import { Application } from '../aggregates/Application.ts';
import { deleteApplicationError } from '../errors/application/deleteApplication.error.ts';
import { getApplicationError } from '../errors/application/getApplication.error.ts';
import { saveApplicationError } from '../errors/application/saveApplication.error.ts';
import { updateApplicationError } from '../errors/application/updateApplication.error.ts';

export interface IApplicationRepository {
    save(value: Application): Promise<Result<void, saveApplicationError>>;

    getAll(): Promise<Result<Application[], getApplicationError>>
    getByUUID(uuid: string): Promise<Result<Application, getApplicationError>>
    getByOffer(uuid: string): Promise<Result<Application[], getApplicationError>>

    update(value: Application): Promise<Result<void, updateApplicationError>>
    delete(uuid: string): Promise<Result<void, deleteApplicationError>>
}
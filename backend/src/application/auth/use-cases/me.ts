import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { IUserRepository } from "src/domain/users/repositories/IUserRepository.ts";
import { UserData } from "../types/UserData.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export async function me(uuid: string, repository: IUserRepository): Promise<Result<UserData, GenericError>> {
    const userData = await repository.getByUuid(uuid)
    if (!userData.ok) return Err(userData.error)
    const usr = userData.value
    const resultData: UserData = {
        uuid: usr.getUUID().toPrimitive(),
        email: usr.getEmail().getValue(),
        name: usr.getName(),
        joinedAt: usr.getJoinDate()
    }
    return Ok(resultData)
}
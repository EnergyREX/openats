import { UUID } from "../../shared/value-objects/UUID.ts";
import { User } from "../aggregates/User.ts";
import { Email } from "../value-objects/Email.ts";
import { Password } from "../value-objects/Password.ts";

export class UserFactory {

    create(uuid: string, name: string, email: string, password: string, verified: boolean): User {
        const userUUID = new UUID(uuid)

        const userEmail = new Email(email)
        const userPassword = new Password(password)

        const user = new User(userUUID, name, userEmail, userPassword, verified) 

        return user
    }

}
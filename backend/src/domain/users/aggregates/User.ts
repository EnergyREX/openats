import { UUID } from "../../shared/value-objects/UUID.ts"
import { Email } from "../value-objects/Email.ts"
import { Password } from "../value-objects/Password.ts"

export class User {
  private readonly uuid: UUID
  private readonly name: string
  private readonly email: Email
  private readonly password: Password
  private readonly verified: boolean

  constructor(uuid: UUID, name: string, email: Email, password: Password, verified: boolean) {
      this.uuid = uuid
      this.name = name
      this.email = email
      this.password = password
      this.verified = verified
  }

  getUser() { return this }
  getUUID(): string { return this.uuid.toPrimitive() }
  getName(): string { return this.name }
  getEmail(): string { return this.email.getValue() }
  getPassword(): string { return this.password.getValue() }
  isVerified(): boolean { return this.verified }

  toJson() {
    return {
        uuid: this.uuid.toPrimitive(),
        username: this.name,
        email: this.email.getValue(),
    }
  }
}

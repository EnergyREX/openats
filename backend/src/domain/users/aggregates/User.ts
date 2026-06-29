import { UUID } from "../../shared/value-objects/UUID.ts"
import { Email } from "../value-objects/Email.ts"
import { Password } from "../value-objects/Password.ts"

export class User {


  constructor(
      private readonly uuid: UUID,
      private readonly name: string,
      private readonly email: Email,
      private readonly password: Password,
      private readonly verified: boolean,
      private readonly joinDate: Date,
  ) { }

  static create(uuid: string, name: string, email: string, password: string, verified: boolean): User {  
    const userEmail = new Email(email)
        const userPassword = new Password(password)

        const user = new User(
          new UUID(uuid), 
          name, 
          userEmail, 
          userPassword, 
          verified,
          new Date()) 

        return user
  }

  getUser() { return this }
  getUUID(): UUID { return this.uuid }
  getName(): string { return this.name }
  getEmail(): Email { return this.email }
  getPassword(): string { return this.password.getValue() }
  isVerified(): boolean { return this.verified }
  getJoinDate(): Date { return this.joinDate }

  toJson() {
    return {
        uuid: this.uuid,
        username: this.name,
        email: this.email.getValue(),
    }
  }
}

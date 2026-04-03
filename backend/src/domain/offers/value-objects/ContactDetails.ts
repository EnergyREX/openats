export class ContactDetails {
    private readonly name?: string
    private readonly phoneNumber?: string
    private readonly address?: string
    private readonly email?: string


    constructor(name?: string, phoneNumber?: string, address?: string, email?: string) {
        this.name = name
        this.phoneNumber = phoneNumber
        this.address = address
        this.email = email
    }

    getName() { return this.name }
    getPhoneNumber() { return this.phoneNumber }
    getAddress() { return this.address }
    getEmail() { return this.email }
}
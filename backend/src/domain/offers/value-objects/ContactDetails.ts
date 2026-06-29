export class ContactDetails {
    private readonly phoneNumber?: string
    private readonly address?: string
    private readonly email?: string
    private readonly website?: string
    private readonly github?: string
    private readonly linkedin?: string

    constructor(phoneNumber?: string, address?: string, email?: string, website?: string, github?: string, linkedin?: string) {
        this.phoneNumber = phoneNumber
        this.address = address
        this.email = email
        this.website = website
        this.github = github
        this.linkedin = linkedin
    }

    toJson() {
        return {
            phoneNumber: this.phoneNumber,
            address: this.address,
            email: this.email,
            website: this.website,
            github: this.github,
            linkedin: this.linkedin
        }
    }
    getPhoneNumber() { return this.phoneNumber }
    getAddress() { return this.address }
    getEmail() { return this.email }
    getWebsite() { return this.website }
    getGithub() { return this.github }
    getLinkedin() { return this.linkedin }
}
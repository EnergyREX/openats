export class Email {
  private readonly value: string

  constructor(email: string) {
    const emailRule = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/

    if (emailRule.test(email)) {
      this.value = email
    } else {
      throw new Error("[DOMAIN] Email Pattern does not match, write another!")
    }
  }

  getValue() {
    return this.value
  }
}

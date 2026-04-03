export class Password {
  private readonly value: string

  constructor(password: string) {
    const passwdRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwdRegExp.test(password)) {
      throw new Error('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    }
    this.value = password
  }

  getValue() {
    return this.value
  }
}

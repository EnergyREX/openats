import { Password } from '../value-objects/Password.ts'

describe('Password Value Object', () => {
  describe('valid passwords', () => {
    it('should create a Password instance with a valid password', () => {
      const validPassword = 'Password123'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })

    it('should accept 8 character passwords', () => {
      const validPassword = 'Abcdef12'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })

    it('should accept long passwords', () => {
      const validPassword = 'MyVeryLongPassword123WithManyCharacters'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })

    it('should accept passwords with special characters', () => {
      const validPassword = 'Pass@word123!'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })

    it('should accept passwords with multiple uppercase letters', () => {
      const validPassword = 'PASSword123'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })

    it('should accept passwords with multiple lowercase letters', () => {
      const validPassword = 'passwordPASSWORD123'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })

    it('should accept passwords with multiple digits', () => {
      const validPassword = 'Password123456'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })

    it('should accept passwords with spaces', () => {
      const validPassword = 'Pass word 123'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })
  })

  describe('invalid passwords', () => {
    it('should throw error for password without uppercase letter', () => {
      const invalidPassword = 'password123'
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })

    it('should throw error for password without lowercase letter', () => {
      const invalidPassword = 'PASSWORD123'
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })

    it('should throw error for password without digit', () => {
      const invalidPassword = 'PasswordAbcd'
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })

    it('should throw error for password less than 8 characters', () => {
      const invalidPassword = 'Pass12'
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })

    it('should throw error for empty password', () => {
      const invalidPassword = ''
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })

    it('should throw error for password with only uppercase', () => {
      const invalidPassword = 'ABCDEFGH1'
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })

    it('should throw error for password with only lowercase', () => {
      const invalidPassword = 'abcdefgh1'
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })

    it('should throw error for password with only numbers and uppercase', () => {
      const invalidPassword = 'ABCDEF123'
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })

    it('should throw error for password with only numbers and lowercase', () => {
      const invalidPassword = 'abcdef123'
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })

    it('should throw error for 7 character password meeting all criteria', () => {
      const invalidPassword = 'Pass12a'
      
      expect(() => new Password(invalidPassword)).toThrow('[DOMAIN] Password must have at least 8 chars, with uppercase, lowercase and number')
    })
  })

  describe('edge cases', () => {
    it('should handle very long passwords', () => {
      const validPassword = 'A' + 'a'.repeat(100) + '123'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })

    it('should handle passwords with many special characters', () => {
      const validPassword = 'Pass@word!#$%&123'
      const password = new Password(validPassword)
      
      expect(password.getValue()).toBe(validPassword)
    })

    it('should treat identical passwords as equal', () => {
      const pwd1 = new Password('Password123')
      const pwd2 = new Password('Password123')
      
      expect(pwd1.getValue()).toBe(pwd2.getValue())
    })
  })
})

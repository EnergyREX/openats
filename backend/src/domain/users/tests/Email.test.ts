import { Email } from '../value-objects/Email.ts'

describe('Email Value Object', () => {
  describe('valid emails', () => {
    it('should create an Email instance with a valid email address', () => {
      const validEmail = 'user@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with numbers', () => {
      const validEmail = 'user123@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with special characters', () => {
      const validEmail = 'user+tag@example.co.uk'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with dots in local part', () => {
      const validEmail = 'user.name@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with multiple domain levels', () => {
      const validEmail = 'user@subdomain.example.co.uk'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with underscore', () => {
      const validEmail = 'user_name@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with hyphen', () => {
      const validEmail = 'user-name@example-domain.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with exclamation mark', () => {
      const validEmail = 'user!name@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with percent sign', () => {
      const validEmail = 'user%name@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with ampersand', () => {
      const validEmail = 'user&name@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should accept emails with consecutive dots', () => {
      const validEmail = 'user..name@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })
  })

  describe('invalid emails', () => {
    it('should throw error for email without @ symbol', () => {
      const invalidEmail = 'userexample.com'
      
      expect(() => new Email(invalidEmail)).toThrow('[DOMAIN] Email Pattern does not match, write another!')
    })

    it('should throw error for email without domain', () => {
      const invalidEmail = 'user@'
      
      expect(() => new Email(invalidEmail)).toThrow('[DOMAIN] Email Pattern does not match, write another!')
    })

    it('should throw error for email without local part', () => {
      const invalidEmail = '@example.com'
      
      expect(() => new Email(invalidEmail)).toThrow('[DOMAIN] Email Pattern does not match, write another!')
    })

    it('should throw error for email without TLD', () => {
      const invalidEmail = 'user@example'
      
      expect(() => new Email(invalidEmail)).toThrow('[DOMAIN] Email Pattern does not match, write another!')
    })

    it('should throw error for empty string', () => {
      const invalidEmail = ''
      
      expect(() => new Email(invalidEmail)).toThrow('[DOMAIN] Email Pattern does not match, write another!')
    })

    it('should throw error for email with spaces', () => {
      const invalidEmail = 'user name@example.com'
      
      expect(() => new Email(invalidEmail)).toThrow('[DOMAIN] Email Pattern does not match, write another!')
    })

    it('should throw error for email with multiple @ symbols', () => {
      const invalidEmail = 'user@name@example.com'
      
      expect(() => new Email(invalidEmail)).toThrow('[DOMAIN] Email Pattern does not match, write another!')
    })

    it('should throw error for missing @ and domain', () => {
      const invalidEmail = 'usernameonly'
      
      expect(() => new Email(invalidEmail)).toThrow('[DOMAIN] Email Pattern does not match, write another!')
    })
  })

  describe('edge cases', () => {
    it('should handle email with very long local part', () => {
      const validEmail = 'a'.repeat(64) + '@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should handle email with multiple dots in domain', () => {
      const validEmail = 'user@example.co.uk.org'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should treat different cases of same email separately', () => {
      const email1 = new Email('user@example.com')
      const email2 = new Email('USER@EXAMPLE.COM')
      
      expect(email1.getValue()).toBe('user@example.com')
      expect(email2.getValue()).toBe('USER@EXAMPLE.COM')
    })

    it('should accept emails with numbers at the beginning', () => {
      const validEmail = '123user@example.com'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })

    it('should store the exact email value provided', () => {
      const validEmail = 'user+filter@example.co.uk'
      const email = new Email(validEmail)
      
      expect(email.getValue()).toBe(validEmail)
    })
  })
})

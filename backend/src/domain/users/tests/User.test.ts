import { User } from '../aggregates/User.ts'
import { UUID } from '../../shared/value-objects/UUID.ts'
import { Email } from '../value-objects/Email.ts'
import { Password } from '../value-objects/Password.ts'

describe('User Aggregate', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'
  const validEmail = 'user@example.com'
  const validPassword = 'Password123'
  const userName = 'John Doe'

  const createValidUser = (
    uuid: string = validUUID,
    name: string = userName,
    email: string = validEmail,
    password: string = validPassword,
    verified: boolean = false
  ): User => {
    return new User(
      new UUID(uuid),
      name,
      new Email(email),
      new Password(password),
      verified
    )
  }

  describe('constructor', () => {
    it('should create a User instance with valid data', () => {
      const user = createValidUser()
      
      expect(user).toBeInstanceOf(User)
    })

    it('should initialize all properties correctly', () => {
      const user = createValidUser()
      
      expect(user.getUUID()).toBe(validUUID)
      expect(user.getName()).toBe(userName)
      expect(user.getEmail()).toBe(validEmail)
      expect(user.getPassword()).toBe(validPassword)
      expect(user.isVerified()).toBe(false)
    })

    it('should initialize verified as true when provided', () => {
      const user = createValidUser(validUUID, userName, validEmail, validPassword, true)
      
      expect(user.isVerified()).toBe(true)
    })

    it('should reject invalid UUID', () => {
      expect(() => {
        new User(
          new UUID('invalid-uuid'),
          userName,
          new Email(validEmail),
          new Password(validPassword),
          false
        )
      }).toThrow()
    })

    it('should reject invalid email', () => {
      expect(() => {
        new User(
          new UUID(validUUID),
          userName,
          new Email('invalid-email'),
          new Password(validPassword),
          false
        )
      }).toThrow()
    })

    it('should reject invalid password', () => {
      expect(() => {
        new User(
          new UUID(validUUID),
          userName,
          new Email(validEmail),
          new Password('weak'),
          false
        )
      }).toThrow()
    })
  })

  describe('getters', () => {
    it('getUUID should return the UUID as string', () => {
      const user = createValidUser()
      
      expect(user.getUUID()).toBe(validUUID)
      expect(typeof user.getUUID()).toBe('string')
    })

    it('getName should return the user name', () => {
      const user = createValidUser()
      
      expect(user.getName()).toBe(userName)
    })

    it('getEmail should return the email value', () => {
      const user = createValidUser()
      
      expect(user.getEmail()).toBe(validEmail)
    })

    it('getPassword should return the password value', () => {
      const user = createValidUser()
      
      expect(user.getPassword()).toBe(validPassword)
    })

    it('isVerified should return verification status', () => {
      const unverifiedUser = createValidUser(validUUID, userName, validEmail, validPassword, false)
      const verifiedUser = createValidUser(validUUID, userName, validEmail, validPassword, true)
      
      expect(unverifiedUser.isVerified()).toBe(false)
      expect(verifiedUser.isVerified()).toBe(true)
    })

    it('getUser should return the user instance itself', () => {
      const user = createValidUser()
      
      expect(user.getUser()).toBe(user)
    })
  })

  describe('toJson', () => {
    it('should convert user to JSON with correct structure', () => {
      const user = createValidUser()
      const json = user.toJson()
      
      expect(json).toEqual({
        uuid: validUUID,
        username: userName,
        email: validEmail
      })
    })

    it('should exclude password from JSON representation', () => {
      const user = createValidUser()
      const json = user.toJson()
      
      expect(json).not.toHaveProperty('password')
    })

    it('should exclude verified flag from JSON representation', () => {
      const user = createValidUser(validUUID, userName, validEmail, validPassword, true)
      const json = user.toJson()
      
      expect(json).not.toHaveProperty('verified')
    })

    it('should have correct property names in JSON', () => {
      const user = createValidUser()
      const json = user.toJson()
      
      expect(Object.keys(json)).toEqual(['uuid', 'username', 'email'])
    })

    it('should include UUID in serialized output', () => {
      const user = createValidUser()
      const json = user.toJson()
      
      expect(json).toHaveProperty('uuid')
      expect(json.uuid).toBe(validUUID)
    })

    it('should include username in serialized output', () => {
      const user = createValidUser()
      const json = user.toJson()
      
      expect(json).toHaveProperty('username')
      expect(json.username).toBe(userName)
    })

    it('should include email in serialized output', () => {
      const user = createValidUser()
      const json = user.toJson()
      
      expect(json).toHaveProperty('email')
      expect(json.email).toBe(validEmail)
    })
  })

  describe('multiple instances', () => {
    it('should create independent user instances', () => {
      const user1 = createValidUser(
        '550e8400-e29b-41d4-a716-446655440001',
        'User One',
        'user1@example.com'
      )
      const user2 = createValidUser(
        '550e8400-e29b-41d4-a716-446655440002',
        'User Two',
        'user2@example.com'
      )
      
      expect(user1.getUUID()).not.toBe(user2.getUUID())
      expect(user1.getName()).not.toBe(user2.getName())
      expect(user1.getEmail()).not.toBe(user2.getEmail())
    })

    it('should not share state between instances', () => {
      const user1 = createValidUser()
      const user2 = createValidUser()
      
      expect(user1.getUser()).not.toBe(user2.getUser())
    })
  })

  describe('edge cases', () => {
    it('should handle very long names', () => {
      const longName = 'a'.repeat(255)
      const user = createValidUser(validUUID, longName)
      
      expect(user.getName()).toBe(longName)
    })

    it('should handle names with special characters', () => {
      const specialName = "O'Brien-Smith José"
      const user = createValidUser(validUUID, specialName)
      
      expect(user.getName()).toBe(specialName)
    })

    it('should handle empty string name', () => {
      const user = createValidUser(validUUID, '')
      
      expect(user.getName()).toBe('')
    })

    it('should maintain state consistency across multiple calls', () => {
      const user = createValidUser()
      const uuid1 = user.getUUID()
      const uuid2 = user.getUUID()
      
      expect(uuid1).toBe(uuid2)
    })

    it('should handle different verified states', () => {
      const unverified = createValidUser(validUUID, userName, validEmail, validPassword, false)
      const verified = createValidUser(validUUID, userName, validEmail, validPassword, true)
      
      expect(unverified.isVerified()).toBe(false)
      expect(verified.isVerified()).toBe(true)
    })

    it('should correctly expose all getter methods', () => {
      const user = createValidUser()
      
      expect(typeof user.getUUID).toBe('function')
      expect(typeof user.getName).toBe('function')
      expect(typeof user.getEmail).toBe('function')
      expect(typeof user.getPassword).toBe('function')
      expect(typeof user.isVerified).toBe('function')
      expect(typeof user.getUser).toBe('function')
    })
  })
})

import { UserFactory } from '../factories/User.factory.ts'
import { User } from '../aggregates/User.ts'

describe('UserFactory', () => {
  const factory = new UserFactory()
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'
  const validEmail = 'user@example.com'
  const validPassword = 'Password123'
  const userName = 'John Doe'

  describe('create', () => {
    it('should create a User instance with valid parameters', () => {
      const user = factory.create(validUUID, userName, validEmail, validPassword, false)
      
      expect(user).toBeInstanceOf(User)
    })

    it('should set all properties correctly', () => {
      const user = factory.create(validUUID, userName, validEmail, validPassword, false)
      
      expect(user.getUUID()).toBe(validUUID)
      expect(user.getName()).toBe(userName)
      expect(user.getEmail()).toBe(validEmail)
      expect(user.getPassword()).toBe(validPassword)
      expect(user.isVerified()).toBe(false)
    })

    it('should create verified user when verified is true', () => {
      const user = factory.create(validUUID, userName, validEmail, validPassword, true)
      
      expect(user.isVerified()).toBe(true)
    })

    it('should create unverified user when verified is false', () => {
      const user = factory.create(validUUID, userName, validEmail, validPassword, false)
      
      expect(user.isVerified()).toBe(false)
    })

    it('should handle different valid UUIDs', () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440001'
      const uuid2 = '550e8400-e29b-41d4-a716-446655440002'
      
      const user1 = factory.create(uuid1, userName, validEmail, validPassword, false)
      const user2 = factory.create(uuid2, userName, validEmail, validPassword, false)
      
      expect(user1.getUUID()).not.toBe(user2.getUUID())
    })

    it('should handle different valid emails', () => {
      const email1 = 'user1@example.com'
      const email2 = 'user2@example.com'
      
      const user1 = factory.create(validUUID, userName, email1, validPassword, false)
      const user2 = factory.create(validUUID, userName, email2, validPassword, false)
      
      expect(user1.getEmail()).not.toBe(user2.getEmail())
    })

    it('should handle different user names', () => {
      const name1 = 'John Doe'
      const name2 = 'Jane Smith'
      
      const user1 = factory.create(validUUID, name1, validEmail, validPassword, false)
      const user2 = factory.create(validUUID, name2, validEmail, validPassword, false)
      
      expect(user1.getName()).not.toBe(user2.getName())
    })

    it('should handle different valid passwords', () => {
      const password1 = 'Password123'
      const password2 = 'AnotherPass456'
      
      const user1 = factory.create(validUUID, userName, validEmail, password1, false)
      const user2 = factory.create(validUUID, userName, validEmail, password2, false)
      
      expect(user1.getPassword()).not.toBe(user2.getPassword())
    })

    it('should throw error for invalid UUID', () => {
      const invalidUUID = 'not-a-valid-uuid'
      
      expect(() => {
        factory.create(invalidUUID, userName, validEmail, validPassword, false)
      }).toThrow()
    })

    it('should throw error for invalid email', () => {
      const invalidEmail = 'not-an-email'
      
      expect(() => {
        factory.create(validUUID, userName, invalidEmail, validPassword, false)
      }).toThrow()
    })

    it('should throw error for invalid password', () => {
      const invalidPassword = 'weak'
      
      expect(() => {
        factory.create(validUUID, userName, validEmail, invalidPassword, false)
      }).toThrow()
    })

    it('should throw error for invalid UUID format', () => {
      const invalidUUID = '550e8400-e29b-41d4-a716'
      
      expect(() => {
        factory.create(invalidUUID, userName, validEmail, validPassword, false)
      }).toThrow()
    })
  })

  describe('factory idempotency', () => {
    it('should create identical users with same parameters', () => {
      const user1 = factory.create(validUUID, userName, validEmail, validPassword, true)
      const user2 = factory.create(validUUID, userName, validEmail, validPassword, true)
      
      expect(user1.getUUID()).toBe(user2.getUUID())
      expect(user1.getName()).toBe(user2.getName())
      expect(user1.getEmail()).toBe(user2.getEmail())
      expect(user1.getPassword()).toBe(user2.getPassword())
      expect(user1.isVerified()).toBe(user2.isVerified())
    })

    it('should create independent instances', () => {
      const user1 = factory.create(validUUID, userName, validEmail, validPassword, false)
      const user2 = factory.create(validUUID, userName, validEmail, validPassword, false)
      
      expect(user1.getUser()).not.toBe(user2.getUser())
    })
  })

  describe('edge cases', () => {
    it('should handle UUID with lowercase letters', () => {
      const lowercaseUUID = '550e8400-e29b-41d4-a716-446655440000'
      const user = factory.create(lowercaseUUID, userName, validEmail, validPassword, false)
      
      expect(user.getUUID()).toBe(lowercaseUUID)
    })

    it('should handle very long names', () => {
      const longName = 'a'.repeat(255)
      const user = factory.create(validUUID, longName, validEmail, validPassword, false)
      
      expect(user.getName()).toBe(longName)
    })

    it('should handle empty string names', () => {
      const emptyName = ''
      const user = factory.create(validUUID, emptyName, validEmail, validPassword, false)
      
      expect(user.getName()).toBe(emptyName)
    })

    it('should handle complex valid emails', () => {
      const complexEmail = 'user+tag@sub.example.co.uk'
      const user = factory.create(validUUID, userName, complexEmail, validPassword, false)
      
      expect(user.getEmail()).toBe(complexEmail)
    })

    it('should handle long valid passwords', () => {
      const longPassword = 'Aa1' + 'b'.repeat(100)
      const user = factory.create(validUUID, userName, validEmail, longPassword, false)
      
      expect(user.getPassword()).toBe(longPassword)
    })

    it('should handle special characters in names', () => {
      const specialName = "O'Brien-José"
      const user = factory.create(validUUID, specialName, validEmail, validPassword, false)
      
      expect(user.getName()).toBe(specialName)
    })

    it('should create correct JSON representation', () => {
      const user = factory.create(validUUID, userName, validEmail, validPassword, true)
      const json = user.toJson()
      
      expect(json).toEqual({
        uuid: validUUID,
        username: userName,
        email: validEmail
      })
    })
  })

  describe('multiple factory instances', () => {
    it('should create consistent users regardless of factory instance', () => {
      const factory1 = new UserFactory()
      const factory2 = new UserFactory()
      
      const user1 = factory1.create(validUUID, userName, validEmail, validPassword, false)
      const user2 = factory2.create(validUUID, userName, validEmail, validPassword, false)
      
      expect(user1.getUUID()).toBe(user2.getUUID())
      expect(user1.getName()).toBe(user2.getName())
    })
  })
})

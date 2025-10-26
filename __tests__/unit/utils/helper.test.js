// __tests__/unit/utils/helpers.test.js
import {formatDateFromMongo, getUserInitials, calculateReadTime, extractAuthorInfo, isValidEmail} from "@/src/utils/helper"

describe("Helper Utilities", () => {
  describe("formatDateFromMongo", () => {
    // Tests date formatting which is critical for blog post displays
    it("should format valid date strings correctly", () => {
      const testDate = "2025-01-15T10:30:00.000Z"
      const result = formatDateFromMongo(testDate, "short")
      expect(result).toMatch(/Jan 15, 2025/)
    })

    it("should handle invalid dates gracefully", () => {
      expect(formatDateFromMongo("invalid")).toBe("")
      expect(formatDateFromMongo(null)).toBe("")
    })
  })

  describe("getUserInitials", () => {
    // Tests user avatar generation which appears in multiple components
    it("should extract initials from full names", () => {
      expect(getUserInitials("John Doe")).toBe("JD")
      expect(getUserInitials("Sarah Jane Smith")).toBe("SJ")
    })

    it("should handle edge cases", () => {
      expect(getUserInitials("")).toBe("U")
      expect(getUserInitials(null)).toBe("U")
    })
  })

  describe("calculateReadTime", () => {
    // Tests reading time estimation for blog posts
    it("should calculate reading time based on word count", () => {
      const shortText = "This is a test."
      const longText = Array(300).fill("word").join(" ")

      expect(calculateReadTime(shortText)).toBe("5 min read")
      expect(calculateReadTime(longText)).toBe("2 min read")
    })
  })

  describe("extractAuthorInfo", () => {
    // Tests author data extraction for backward compatibility
    it("should extract author info from object structure", () => {
      const post = {
        author: {
          uid: "user123",
          name: "John Doe",
          email: "john@example.com",
        },
      }

      const result = extractAuthorInfo(post)
      expect(result.uid).toBe("user123")
      expect(result.name).toBe("John Doe")
    })

    it("should handle legacy string author format", () => {
      const post = {
        author: "user123",
        authorUid: "user123",
      }

      const result = extractAuthorInfo(post)
      expect(result.uid).toBe("user123")
      expect(result.name).toBe("Anonymous")
    })
  })

  describe("isValidEmail", () => {
    // Tests email validation used in authentication forms
    it("should validate email formats correctly", () => {
      expect(isValidEmail("test@example.com")).toBe(true)
      expect(isValidEmail("invalid.email")).toBe(false)
      expect(isValidEmail("")).toBe(false)
    })
  })
})

import {formatDateFromMongo, getUserInitials, calculateReadTime, truncateText, isValidEmail} from "@/src/utils/helper"

describe("Helper Functions", () => {
  describe("formatDateFromMongo", () => {
    it("formats date correctly in short format", () => {
      const date = new Date("2024-01-15")
      expect(formatDateFromMongo(date, "short")).toBe("Jan 15, 2024")
    })

    it("handles invalid date", () => {
      expect(formatDateFromMongo("invalid")).toBe("")
      expect(formatDateFromMongo(null)).toBe("")
    })
  })

  describe("getUserInitials", () => {
    it("returns correct initials for full name", () => {
      expect(getUserInitials("John Doe")).toBe("JD")
    })

    it("returns single initial for single name", () => {
      expect(getUserInitials("John")).toBe("JO")
    })

    it("returns U for empty name", () => {
      expect(getUserInitials("")).toBe("U")
      expect(getUserInitials(null)).toBe("U")
    })
  })

  describe("calculateReadTime", () => {
    it("calculates reading time correctly", () => {
      const text = "word ".repeat(200)
      expect(calculateReadTime(text)).toBe("1 min read")
    })

    it("returns default for empty text", () => {
      expect(calculateReadTime("")).toBe("5 min read")
    })
  })

  describe("truncateText", () => {
    it("truncates long text", () => {
      const longText = "a".repeat(150)
      const result = truncateText(longText, 100)
      expect(result).toHaveLength(103) // 100 + "..."
      expect(result).toEndWith("...")
    })

    it("does not truncate short text", () => {
      const shortText = "short"
      expect(truncateText(shortText, 100)).toBe("short")
    })
  })

  describe("isValidEmail", () => {
    it("validates correct emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true)
      expect(isValidEmail("user.name+tag@example.co.uk")).toBe(true)
    })

    it("rejects invalid emails", () => {
      expect(isValidEmail("invalid")).toBe(false)
      expect(isValidEmail("test@")).toBe(false)
      expect(isValidEmail("@example.com")).toBe(false)
    })
  })
})

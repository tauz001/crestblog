import {GET, POST, PUT, DELETE} from "@/app/api/user/route"
import dbConnect from "@/src/lib/mongoose"
import User from "@/src/models/user"

// Mock database
jest.mock("@/src/lib/mongoose")
jest.mock("@/src/models/user")

describe("User API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET /api/user", () => {
    it("returns all users when no UID provided", async () => {
      const mockUsers = [
        {uid: "1", name: "User 1", email: "user1@test.com"},
        {uid: "2", name: "User 2", email: "user2@test.com"},
      ]

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
        }),
      })

      User.countDocuments = jest.fn().mockResolvedValue(2)

      const request = new Request("http://localhost:3000/api/user")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
    })

    it("returns specific user when UID provided", async () => {
      const mockUser = {
        uid: "123",
        name: "Test User",
        email: "test@test.com",
      }

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      })

      const request = new Request("http://localhost:3000/api/user?uid=123")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.uid).toBe("123")
    })

    it("returns 404 when user not found", async () => {
      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      })

      const request = new Request("http://localhost:3000/api/user?uid=999")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })

  describe("POST /api/user", () => {
    it("creates new user successfully", async () => {
      const newUser = {
        uid: "123",
        name: "New User",
        email: "new@test.com",
      }

      User.findOne = jest.fn().mockResolvedValue(null)
      User.create = jest.fn().mockResolvedValue(newUser)

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify(newUser),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.email).toBe("new@test.com")
    })

    it("returns 400 when required fields missing", async () => {
      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({name: "Test"}), // Missing email and uid
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it("returns 409 when user already exists", async () => {
      User.findOne = jest.fn().mockResolvedValue({uid: "123"})

      const request = new Request("http://localhost:3000/api/user", {
        method: "POST",
        body: JSON.stringify({
          uid: "123",
          name: "Test",
          email: "test@test.com",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain("already exists")
    })
  })
})

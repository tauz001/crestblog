// __tests__/integration/api/publish.test.js
import {POST, GET} from "@/app/api/publish/route"
import dbConnect from "@/src/lib/mongoose"
import Post from "@/src/models/post"
import User from "@/src/models/user"

jest.mock("@/src/lib/mongoose")
jest.mock("@/src/models/post")
jest.mock("@/src/models/user")

describe("Publish API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST /api/publish", () => {
    // Tests successful blog post creation
    it("should create a new blog post with author data", async () => {
      const mockUser = {
        uid: "user123",
        name: "John Doe",
        email: "john@example.com",
        avatar: "",
        bio: "Test bio",
      }

      const requestBody = {
        title: "Test Blog Post",
        category: "Technology",
        summary: "Test summary",
        sections: [
          {
            subHeading: "Introduction",
            content: "Test content here",
          },
        ],
        authorUid: "user123",
        featuredImage: {
          url: "https://example.com/image.jpg",
          alt: "Test image",
        },
      }

      dbConnect.mockResolvedValue()
      User.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      })
      Post.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      })
      Post.create.mockResolvedValue({
        _id: "post123",
        ...requestBody,
        author: mockUser,
      })

      const request = new Request("http://localhost:3000/api/publish", {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.postId).toBe("post123")
      expect(Post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Blog Post",
          author: expect.objectContaining({
            uid: "user123",
            name: "John Doe",
          }),
        })
      )
    })

    // Tests duplicate post detection
    it("should detect and prevent duplicate posts", async () => {
      const mockUser = {
        uid: "user123",
        name: "John Doe",
        email: "john@example.com",
      }

      const existingPost = {
        _id: "existing123",
        title: "Test Blog Post",
      }

      dbConnect.mockResolvedValue()
      User.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      })
      Post.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(existingPost),
      })

      const request = new Request("http://localhost:3000/api/publish", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Blog Post",
          sections: [{subHeading: "Test", content: "Content"}],
          authorUid: "user123",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.duplicate).toBe(true)
      expect(data.postId).toBe("existing123")
      expect(Post.create).not.toHaveBeenCalled()
    })

    // Tests validation for missing required fields
    it("should reject requests with missing required fields", async () => {
      const request = new Request("http://localhost:3000/api/publish", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Post",
          // Missing sections and authorUid
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })

  describe("GET /api/publish", () => {
    // Tests retrieving all published posts
    it("should return all posts sorted by creation date", async () => {
      const mockPosts = [
        {
          _id: "post1",
          title: "First Post",
          createdAt: "2025-01-20",
        },
        {
          _id: "post2",
          title: "Second Post",
          createdAt: "2025-01-19",
        },
      ]

      dbConnect.mockResolvedValue()
      Post.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPosts),
      })

      const response = await GET()
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockPosts)
      expect(Post.find).toHaveBeenCalledWith({})
    })
  })
})

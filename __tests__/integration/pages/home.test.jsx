import {render, screen, waitFor} from "@testing-library/react"
import Homepage from "@/app/page"
import {AuthProvider} from "@/src/context/authContext"

// Mock fetch
global.fetch = jest.fn()

const mockPosts = [
  {
    _id: "1",
    title: "Test Post 1",
    category: "Technology",
    summary: "Test summary 1",
    author: {name: "Author 1"},
    createdAt: "2024-01-01",
  },
  {
    _id: "2",
    title: "Test Post 2",
    category: "Lifestyle",
    summary: "Test summary 2",
    author: {name: "Author 2"},
    createdAt: "2024-01-02",
  },
]

describe("Homepage Integration", () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it("loads and displays blog posts", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({success: true, data: mockPosts}),
    })

    render(
      <AuthProvider>
        <Homepage />
      </AuthProvider>
    )

    // Should show loading initially
    expect(screen.getByText("Loading blogs...")).toBeInTheDocument()

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByText("Test Post 1")).toBeInTheDocument()
      expect(screen.getByText("Test Post 2")).toBeInTheDocument()
    })
  })

  it("filters posts by category", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({success: true, data: mockPosts}),
    })

    const {container} = render(
      <AuthProvider>
        <Homepage />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Test Post 1")).toBeInTheDocument()
    })

    // Click Technology category
    const techButton = screen.getByText("Technology")
    fireEvent.click(techButton)

    // Should only show Technology posts
    expect(screen.getByText("Test Post 1")).toBeInTheDocument()
    expect(screen.queryByText("Test Post 2")).not.toBeInTheDocument()
  })

  it("handles API error gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"))

    render(
      <AuthProvider>
        <Homepage />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("No blogs found in this category.")).toBeInTheDocument()
    })
  })
})

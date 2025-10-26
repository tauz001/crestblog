// __tests__/integration/components/Navbar.test.jsx
import {render, screen, fireEvent, waitFor} from "@testing-library/react"
import Navbar from "@/app/components/Navbar"
import {AuthProvider} from "@/src/context/authContext"
import {useRouter} from "next/navigation"

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock implementation for authenticated user
const mockAuthenticatedUser = {
  uid: "test-uid",
  email: "test@example.com",
  displayName: "Test User",
  emailVerified: true,
  isAnonymous: false,
}

describe("Navbar Component", () => {
  let mockPush

  beforeEach(() => {
    mockPush = jest.fn()
    useRouter.mockReturnValue({push: mockPush})
  })

  // Tests navbar rendering for unauthenticated users
  it("should display login and signup buttons for guests", () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    )

    expect(screen.getByText("Login")).toBeInTheDocument()
    expect(screen.getByText("Sign Up")).toBeInTheDocument()
  })

  // Tests authentication modal interaction
  it("should open auth modal when login button is clicked", async () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    )

    const loginButton = screen.getByText("Login")
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument()
    })
  })

  // Tests authenticated user menu display
  it("should display user menu for authenticated users", async () => {
    jest.spyOn(require("@/src/context/authContext"), "useAuth").mockReturnValue({
      currentUser: mockAuthenticatedUser,
      loading: false,
      logout: jest.fn(),
    })

    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("TU")).toBeInTheDocument() // User initials
    })
  })

  // Tests navigation to protected routes
  it("should show write and blogs links for verified users", async () => {
    jest.spyOn(require("@/src/context/authContext"), "useAuth").mockReturnValue({
      currentUser: mockAuthenticatedUser,
      loading: false,
      logout: jest.fn(),
    })

    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Write")).toBeInTheDocument()
      expect(screen.getByText("Blogs")).toBeInTheDocument()
    })
  })
})

import {render, screen, fireEvent, waitFor} from "@testing-library/react"
import {AuthProvider} from "@/src/context/authContext"
import Navbar from "@/app/components/Navbar"

// Mock auth context
const mockAuthContext = {
  currentUser: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
}

jest.mock("@/src/context/authContext", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({children}) => <div>{children}</div>,
}))

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders logo and navigation links", () => {
    render(<Navbar />)

    expect(screen.getByText("CrestBlog")).toBeInTheDocument()
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
  })

  it("shows login/signup buttons when user not authenticated", () => {
    render(<Navbar />)

    expect(screen.getByText("Login")).toBeInTheDocument()
    expect(screen.getByText("Sign Up")).toBeInTheDocument()
  })

  it("shows user menu when authenticated", () => {
    mockAuthContext.currentUser = {
      uid: "123",
      email: "test@test.com",
      emailVerified: true,
      displayName: "Test User",
    }

    render(<Navbar />)

    expect(screen.queryByText("Login")).not.toBeInTheDocument()
    expect(screen.getByText("TU")).toBeInTheDocument() // User initials
  })

  it("opens auth modal when login button clicked", async () => {
    render(<Navbar />)

    const loginButton = screen.getByText("Login")
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument()
    })
  })

  it("calls logout function when logout clicked", async () => {
    mockAuthContext.currentUser = {
      uid: "123",
      email: "test@test.com",
      emailVerified: true,
    }

    render(<Navbar />)

    // Open user menu
    const userAvatar = screen.getByText("TE")
    fireEvent.mouseEnter(userAvatar.parentElement)

    await waitFor(() => {
      const logoutButton = screen.getByText("Logout")
      fireEvent.click(logoutButton)
    })

    expect(mockAuthContext.logout).toHaveBeenCalled()
  })
})

// __tests__/unit/hooks/useAuth.test.js
import {renderHook, act, waitFor} from "@testing-library/react"
import {AuthProvider, useAuth} from "@/src/context/authContext"
import {onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile, signOut} from "firebase/auth"

jest.mock("firebase/auth")

describe("useAuth Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  // Tests initial authentication state loading
  it("should provide initial loading state", () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      setTimeout(() => callback(null), 0)
      return jest.fn()
    })

    const {result} = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.loading).toBe(true)
  })

  // Tests user signup flow with email verification
  it("should handle user signup with verification", async () => {
    const mockUser = {
      uid: "test-uid",
      email: "test@example.com",
      emailVerified: false,
      reload: jest.fn(),
    }

    createUserWithEmailAndPassword.mockResolvedValue({
      user: mockUser,
    })
    updateProfile.mockResolvedValue()
    sendEmailVerification.mockResolvedValue()
    signOut.mockResolvedValue()

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null)
      return jest.fn()
    })

    const {result} = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.signup("test@example.com", "password123", "Test User")
    })

    expect(createUserWithEmailAndPassword).toHaveBeenCalled()
    expect(updateProfile).toHaveBeenCalled()
    expect(sendEmailVerification).toHaveBeenCalled()
    expect(signOut).toHaveBeenCalled()
  })

  // Tests login flow with verification check
  it("should reject login for unverified users", async () => {
    const mockUser = {
      uid: "test-uid",
      email: "test@example.com",
      emailVerified: false,
      reload: jest.fn(),
    }

    signInWithEmailAndPassword.mockResolvedValue({
      user: mockUser,
    })
    signOut.mockResolvedValue()

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null)
      return jest.fn()
    })

    const {result} = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await expect(result.current.login("test@example.com", "password123")).rejects.toThrow("Please verify your email")
  })

  // Tests successful authentication with verified email
  it("should allow login for verified users", async () => {
    const mockUser = {
      uid: "test-uid",
      email: "test@example.com",
      emailVerified: true,
      reload: jest.fn(),
    }

    signInWithEmailAndPassword.mockResolvedValue({
      user: mockUser,
    })

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({success: true}),
    })

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null)
      return jest.fn()
    })

    const {result} = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.login("test@example.com", "password123")
    })

    expect(signInWithEmailAndPassword).toHaveBeenCalled()
    expect(global.fetch).toHaveBeenCalledWith("/api/user/sync-verification", expect.any(Object))
  })
})

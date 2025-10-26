import "@testing-library/jest-dom"

// Mock environment variables
process.env.MONGODB_URI = "mongodb://localhost:27017/test"
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key"

// Mock Firebase
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}))

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  updateProfile: jest.fn(),
}))

// Mock fetch globally
global.fetch = jest.fn()

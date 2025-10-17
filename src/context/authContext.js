"use client"
import React, {createContext, useContext, useState, useEffect, useMemo} from "react"
// We need to import the firebase initialization functions here,
// even though the main app instance is initialized in src/lib/firebase.js,
// because we still need the helper functions for authentication.
import {getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth"
import {initializeApp, getApps, getApp} from "firebase/app"

// --- 1. Canvas Firebase Initialization (Inlined for demonstration) ---
// NOTE: In a multi-file setup, this config MUST match src/lib/firebase.js exactly.
// Since we are generating a single-file React app, we will simulate the import
// by initializing a stable Firebase instance here, using the config from the Canvas.

const firebaseConfig = {
  apiKey: "AIzaSyCkM8pNDAaGI4CNoYgd2oOMLVX4b_J8evc",
  authDomain: "crestblog001.firebaseapp.com",
  databaseURL: "https://crestblog001-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crestblog001",
  storageBucket: "crestblog001.firebasestorage.app",
  messagingSenderId: "863786997689",
  appId: "1:863786997689:web:de19088d2b18236ff60868",
  measurementId: "G-KRY11F9VCQ",
}

// Implement the CORE FIX from your Canvas file to ensure stability
let firebaseApp
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
} else {
  firebaseApp = getApp()
}

// Export the auth instance we will use throughout the component
const auth = getAuth(firebaseApp)
const isAuthAvailable = !!auth

// --- 2. Context Setup ---
const AuthContext = createContext()

/**
 * Custom hook to consume the authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// --- 3. Auth Provider Component ---
export const AuthProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)

  // 3.1. Initialize Auth State Listener
  useEffect(() => {
    if (!isAuthAvailable) {
      console.error("Firebase Auth instance is not available. Check the configuration.")
      setLoading(false)
      setAuthReady(true)
      return () => {}
    }

    let unsubscribe = () => {}

    const initializeAuth = async () => {
      // Use the global environment token for initial sign-in
      const initialAuthToken = typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null

      if (initialAuthToken) {
        // If a token is provided, use it for custom sign-in
        try {
          await signInWithCustomToken(auth, initialAuthToken)
        } catch (err) {
          console.error("Error signing in with custom token. Falling back to anonymous sign-in.", err)
          await signInAnonymously(auth).catch(err => console.error("Error signing in anonymously:", err))
        }
      } else {
        // Otherwise, sign in anonymously
        await signInAnonymously(auth).catch(err => console.error("Error signing in anonymously:", err))
      }

      // Setup Auth State Listener
      unsubscribe = onAuthStateChanged(auth, user => {
        setCurrentUser(user)
        setLoading(false)
        setAuthReady(true) // Initial state is set
      })
    }

    initializeAuth()

    return () => unsubscribe() // Cleanup listener on unmount
  }, [])

  // 3.2. Auth Actions

  const signup = async (email, password) => {
    if (!auth) throw new Error("Authentication service is not ready.")
    // Note: Email verification removed for simplicity, but can be added back.
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const login = async (email, password) => {
    if (!auth) throw new Error("Authentication service is not ready.")
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
    if (auth) {
      return signOut(auth).catch(err => console.error("Error during sign out:", err))
    }
    console.warn("AUTH: Cannot log out, Auth instance is not initialized.")
    return Promise.resolve()
  }

  // 3.3. Memoized context value for stability
  const value = useMemo(() => {
    // Ensure 'auth' is available before accessing properties
    const authUser = auth && auth.currentUser
    const userId = currentUser?.uid || authUser?.uid || (authReady ? "not-logged-in" : null)

    return {
      currentUser,
      loading,
      login,
      logout,
      signup,
      userId,
      isAnonymous: currentUser?.isAnonymous || false,
    }
  }, [currentUser, loading, authReady])

  // Handle initialization failure state (if config was missing)
  if (!isAuthAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
        <p className="text-xl font-bold text-red-700">Authentication Not Configured</p>
        <p className="mt-2 text-gray-600">Please ensure the Firebase configuration is correct.</p>
      </div>
    )
  }

  // Show loading until auth state is determined
  if (loading || !authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600 font-inter">Loading Authentication...</p>
      </div>
    )
  }

  // Render children once ready
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// --- 4. Simple Auth Forms and Dashboard UI ---

const AuthFormCard = ({title, children, footer}) => (
  <div className="p-8 bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center font-inter">{title}</h2>
    {children}
    {footer && <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-center">{footer}</div>}
  </div>
)

const CustomMessage = ({message, type}) => {
  if (!message) return null
  const baseClasses = "p-3 rounded-lg text-sm mb-4 font-medium shadow-sm font-inter"
  const typeClasses = type === "error" ? "bg-red-100 text-red-800 border border-red-200" : "bg-green-100 text-green-800 border border-green-200"

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      {message}
    </div>
  )
}

const Login = ({switchToSignup}) => {
  const {login} = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      console.error("Login failed:", err)
      setError(err.message || "Failed to log in. Check credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormCard title="Log In">
      <CustomMessage message={error} type="error" />
      <form onSubmit={handleSubmit} className="space-y-4 font-inter">
        <div>
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" />
        </div>
        <div>
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" />
        </div>
        <button type="submit" disabled={loading} className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-300 shadow-md ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
          {loading ? "Logging In..." : "Log In"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm font-inter">
        Need an account?{" "}
        <button type="button" onClick={switchToSignup} className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
          Sign Up
        </button>
      </div>
    </AuthFormCard>
  )
}

const Signup = ({switchToLogin}) => {
  const {signup} = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      await signup(email, password)
      setSuccess(true)
      setEmail("")
      setPassword("")
    } catch (err) {
      console.error("Signup failed:", err)
      setError(err.message || "Failed to sign up. Password must be at least 6 characters.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormCard title="Sign Up">
      <CustomMessage message={error} type="error" />
      {success && <CustomMessage message="Account created successfully! You can now log in." type="success" />}
      <form onSubmit={handleSubmit} className="space-y-4 font-inter">
        <div>
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150" />
        </div>
        <div>
          <input type="password" placeholder="Password (Min 6 chars)" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150" />
        </div>
        <button type="submit" disabled={loading} className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-300 shadow-md ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm font-inter">
        Already have an account?{" "}
        <button type="button" onClick={switchToLogin} className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
          Log In
        </button>
      </div>
    </AuthFormCard>
  )
}

const Dashboard = () => {
  const {currentUser, logout, userId, isAnonymous} = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">User Dashboard</h2>

      <div className="space-y-4">
        <p className="flex justify-between items-center text-lg">
          <span className="font-semibold text-gray-600">Email:</span>
          <span className="text-indigo-600 font-medium break-words">{currentUser?.email || "N/A (Anonymous User)"}</span>
        </p>

        <div className="bg-gray-50 p-3 rounded-lg text-sm break-words shadow-inner">
          <p className="font-mono text-gray-700">
            <span className="font-semibold text-gray-800 mr-2">User ID (UID):</span>
            {userId}
          </p>
          {isAnonymous && <p className="mt-1 text-yellow-700 font-medium">(This is an anonymous session, sign in/up to save data!)</p>}
        </div>
      </div>

      <div className="mt-8">
        <button onClick={handleLogout} disabled={isLoggingOut} className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-300 shadow-md hover:shadow-lg ${isLoggingOut ? "bg-red-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>
          {isLoggingOut ? "Signing Out..." : "Log Out"}
        </button>
      </div>
    </div>
  )
}

const App = () => {
  const {currentUser, loading} = useAuth()
  const [view, setView] = useState("login") // 'login' or 'signup'

  const switchToSignup = () => setView("signup")
  const switchToLogin = () => setView("login")

  let content

  if (loading) {
    // AuthProvider handles global loading state, so this should not fire often,
    // but it's a safe fallback.
    content = <div className="text-gray-600 font-inter">Initializing...</div>
  } else if (currentUser && !currentUser.isAnonymous) {
    // Show the dashboard if a non-anonymous user is authenticated
    content = <Dashboard />
  } else if (view === "login") {
    // Show login form
    content = <Login switchToSignup={switchToSignup} />
  } else {
    // Show signup form
    content = <Signup switchToLogin={switchToLogin} />
  }

  return <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">{content}</div>
}

// Default export of the main App component that uses the provider internally
const MainApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
)

export default MainApp

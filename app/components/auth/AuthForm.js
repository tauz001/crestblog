// /components/Auth/AuthForms.js
"use client"
import {useAuth} from "@/src/context/authContext"
import Link from "next/link"
import React, {useState} from "react"
// import {useAuth} from "@/src/context/authContext" // Import the useAuth hook

// --- Utility Components (Copy these exactly from your original file) ---

const CustomMessage = ({message, type}) => {
  if (!message) return null
  const baseClasses = "p-3 rounded-lg text-sm mb-4 font-medium shadow-sm"
  const typeClasses = type === "error" ? "bg-red-100 text-red-800 border border-red-200" : "bg-green-100 text-green-800 border border-green-200"
  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      {message}
    </div>
  )
}

const AuthFormCard = ({title, children, footer}) => (
  <div className="p-8 bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">{title}</h2>
    {children}
    {footer && <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-center">{footer}</div>}
  </div>
)

// --- Login Component (Uses useAuth().login) ---

const Login = ({switchToSignup}) => {
  const {login, currentUser} = useAuth() // Get login function
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Optional: Log a warning if currentUser is present (already logged in)
  // In a real app, this should probably cause a redirect in the parent page.
  if (currentUser && !currentUser.isAnonymous) {
    return (
      <AuthFormCard title="Already Logged In">
        <CustomMessage message={`Welcome back, ${currentUser.email}!`} type="success" />
        <Link href="/profile" className="w-full block text-center py-3 px-4 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition">
          Go to Profile
        </Link>
      </AuthFormCard>
    )
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      // Successful login is handled by the AuthProvider updating currentUser, which will redirect the user via the Navbar or a check in the parent page.
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (Input fields for email and password) ... */}
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
      <div className="mt-4 text-center text-sm">
        Need an account?{" "}
        <button onClick={switchToSignup} className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
          Sign Up
        </button>
      </div>
    </AuthFormCard>
  )
}

// --- Signup Component (Uses useAuth().signup) ---

const Signup = ({switchToLogin}) => {
  const {signup} = useAuth() // Get signup function
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
      {success && <CustomMessage message="Account created! A verification email has been sent. Please check your inbox and then log in." type="success" />}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (Input fields for email and password) ... */}
        <div>
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" />
        </div>
        <div>
          <input type="password" placeholder="Password (Min 6 chars)" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" />
        </div>
        <button type="submit" disabled={loading} className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-300 shadow-md ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <button onClick={switchToLogin} className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
          Log In
        </button>
      </div>
    </AuthFormCard>
  )
}

// --- Main Auth Forms Wrapper ---

export default function AuthForms() {
  const {currentUser} = useAuth()
  const [view, setView] = useState("login") // 'login' or 'signup'

  // If the user is already authenticated (and not anonymous), redirect them away
  if (currentUser && !currentUser.isAnonymous) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <AuthFormCard title="Already Logged In">
          <CustomMessage message={`Welcome back, ${currentUser.email}!`} type="success" />
          <Link href="/profile" className="w-full block text-center py-3 px-4 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition">
            Go to Profile
          </Link>
        </AuthFormCard>
      </div>
    )
  }

  return <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">{view === "login" ? <Login switchToSignup={() => setView("signup")} /> : <Signup switchToLogin={() => setView("login")} />}</div>
}

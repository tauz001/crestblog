"use client"
import React, {useState, useEffect} from "react"
import {Menu, X, PenSquare, Mountain, User, LogOut, Mail, Lock, Eye, EyeOff, AlertCircle} from "lucide-react"
import Link from "next/link"
import {useAuth} from "@/src/context/authContext"
import {useRouter} from "next/navigation"

// Auth Modal Component
function AuthModal({isOpen, onClose, initialView = "login"}) {
  const [view, setView] = useState(initialView)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const {login, signup, resendVerificationEmail} = useAuth()

  useEffect(() => {
    setView(initialView)
    setError("")
    setSuccess("")
  }, [initialView, isOpen])

  const handleClose = () => {
    setEmail("")
    setPassword("")
    setName("")
    setError("")
    setSuccess("")
    setShowPassword(false)
    onClose()
  }

  const handleLogin = async e => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const userCredential = await login(email, password)

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in. Check your inbox.")
        setLoading(false)
        return
      }

      handleClose()
    } catch (err) {
      setError(err.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async e => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Create Firebase user and send verification email
      const userCredential = await signup(email, password, name)
      const firebaseUid = userCredential.user.uid

      // Create MongoDB user with same UID
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          uid: firebaseUid,
          name: name,
          email: email,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to create user profile")
      }

      // Show success message
      setSuccess("Account created! Please check your email and verify your account before logging in.")
      setEmail("")
      setPassword("")
      setName("")

      // Auto switch to login after 3 seconds
      setTimeout(() => {
        setView("login")
        setSuccess("")
      }, 3000)
    } catch (err) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      await resendVerificationEmail()
      setSuccess("Verification email sent! Please check your inbox.")
    } catch (err) {
      setError(err.message || "Failed to send verification email")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Mountain className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">{view === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p className="text-gray-600 text-center mb-6">{view === "login" ? "Login to continue to CrestBlog" : "Join our community of writers"}</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-semibold transition-all ${loading ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"} text-white shadow-lg`}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {view === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-semibold transition-all ${loading ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"} text-white shadow-lg`}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* Switch View */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {view === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setView(view === "login" ? "signup" : "login")
                setError("")
                setSuccess("")
              }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold">
              {view === "login" ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// Main Navbar Component
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authView, setAuthView] = useState("login")
  const {currentUser, logout, loading} = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsOpen(false)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
      setShowUserMenu(false)
    } catch (error) {
      console.error("Logout failed:", error)
      alert("Failed to logout. Please try again.")
    }
  }

  const handleLoginClick = () => {
    setAuthView("login")
    setShowAuthModal(true)
    setIsOpen(false)
  }

  const handleSignupClick = () => {
    setAuthView("signup")
    setShowAuthModal(true)
    setIsOpen(false)
  }

  const handleProfileClick = () => {
    if (currentUser && !currentUser.isAnonymous) {
      router.push(`/profile/${currentUser.uid}`)
      setShowUserMenu(false)
    }
  }

  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
    }
    if (currentUser?.email) {
      return currentUser.email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  // Check if user is properly authenticated AND verified
  const isAuthenticated = currentUser && !currentUser.isAnonymous && currentUser.emailVerified

  return (
    <>
      <nav className="fixed top-0 w-full bg-white z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <Link href={"/"} className="text-2xl font-bold text-gray-800">
                CrestBlog
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-emerald-600 transition-colors">
                Home
              </Link>
              <Link href="/aboutus" className="text-gray-700 hover:text-emerald-600 transition-colors">
                About
              </Link>

              {isAuthenticated && (
                <>
                  <Link href="/blogs" className="text-gray-700 hover:text-emerald-600 transition-colors">
                    Blogs
                  </Link>
                  <Link href="/news" className="text-gray-700 hover:text-emerald-600 transition-colors">
                    News
                  </Link>
                  <Link href={"/write"} className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                    <PenSquare className="w-4 h-4" />
                    <span>Write</span>
                  </Link>
                </>
              )}

              {loading ? (
                <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
              ) : isAuthenticated ? (
                <div className="relative" onMouseEnter={() => setShowUserMenu(true)} onMouseLeave={() => setShowUserMenu(false)}>
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-200 transition-colors">
                    <span className="text-sm font-semibold text-emerald-700">{getUserInitials()}</span>
                  </div>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.displayName || "User"}</p>
                        <p className="text-xs text-gray-600 truncate">{currentUser.email}</p>
                      </div>

                      <button type="button" onClick={handleProfileClick} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4 mr-3 text-gray-600" />
                        <span>My Profile</span>
                      </button>

                      <hr className="my-2 border-gray-200" />

                      <button type="button" onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button onClick={handleLoginClick} className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                    Login
                  </button>
                  <button onClick={handleSignupClick} className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
              <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link href="/aboutus" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded" onClick={() => setIsOpen(false)}>
                About
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/write" className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white px-5 py-2 rounded-lg mx-4" onClick={() => setIsOpen(false)}>
                    <PenSquare className="w-4 h-4" />
                    <span>Write</span>
                  </Link>

                  <div className="px-4 py-3 border-t border-gray-200 mt-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.email}</p>
                  </div>

                  <button onClick={handleProfileClick} className="w-full text-left flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
                    <User className="w-4 h-4 mr-3" />
                    <span>Profile</span>
                  </button>

                  <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded">
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-4">
                  <button onClick={handleLoginClick} className="w-full flex items-center justify-center space-x-2 bg-white text-emerald-600 border-2 border-emerald-600 px-5 py-2 rounded-lg hover:bg-emerald-50">
                    <span>Login</span>
                  </button>
                  <button onClick={handleSignupClick} className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700">
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialView={authView} />
    </>
  )
}

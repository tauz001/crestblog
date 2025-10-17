// /context/AuthContext.js
// This file contains the AuthProvider and useAuth hook.

"use client"
import React, {createContext, useContext, useState, useEffect, useMemo} from "react"
import {onAuthStateChanged, signInWithCustomToken, signInAnonymously, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification} from "firebase/auth"
// Import the initialized auth instance from your lib file
import {auth} from "@/src/lib/firebase" // Use '@/lib/firebase' or '../../lib/firebase' depending on path
import {ArcLoader} from "../components/Loader"

// --- 1. Context Setup ---
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

// --- 2. Auth Provider Component ---
export const AuthProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  // Tracks if the firebase auth instance is available
  const isAuthAvailable = !!auth // Check if 'auth' from firebase.js is present

  // 2.1. Initialize Auth State Listener
  useEffect(() => {
    if (!isAuthAvailable) {
      console.error("Firebase Auth instance is not available. Check /lib/firebase.js")
      setLoading(false)
      setAuthReady(true)
      return () => {}
    }

    let unsubscribe = () => {}

    const initializeAuth = async () => {
      // Initial anonymous sign-in logic (as in your original file)
      const initialAuthToken = typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null

      if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken).catch(err => {
          console.error("Error signing in with custom token. Falling back to anonymous sign-in.", err)
          signInAnonymously(auth).catch(err => console.error("Error signing in anonymously:", err))
        })
      } else {
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
  }, [isAuthAvailable])

  // 2.2. Auth Actions

  const signup = async (email, password) => {
    if (!auth) throw new Error("Authentication service is not ready.")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Send Verification Email
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user)
      console.log("Verification email sent to:", userCredential.user.email)
    }
    return userCredential
  }

  const login = async (email, password) => {
    if (!auth) throw new Error("Authentication service is not ready.")
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    if (userCredential.user && !userCredential.user.emailVerified) {
      console.warn("User logged in but email is not verified. Check email inbox.")
    }
    return userCredential
  }

  const logout = () => {
    if (auth) {
      return signOut(auth).catch(err => console.error("Error during sign out:", err))
    }
    console.warn("AUTH: Cannot log out, Auth instance is not initialized.")
    return Promise.resolve()
  }

  const resendVerificationEmail = async () => {
    if (!auth || !currentUser) throw new Error("Authentication service or user is not ready.")
    if (currentUser.emailVerified) {
      console.warn("Email is already verified.")
      return
    }
    // Use the latest user object from the auth instance before sending
    await auth.currentUser.reload()
    await sendEmailVerification(auth.currentUser)
    console.log("Verification email resent to:", auth.currentUser.email)
  }

  // 2.3. Memoized context value
  const value = useMemo(() => {
    const userId = currentUser?.uid || auth?.currentUser?.uid || (authReady ? "not-logged-in" : null)

    return {
      currentUser,
      loading,
      login,
      logout,
      signup,
      resendVerificationEmail,
      userId,
      isAnonymous: currentUser?.isAnonymous || false,
    }
  }, [currentUser, loading, authReady])

  // Handle initialization failure state
  if (!isAuthAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
        <p className="text-xl font-bold text-red-700">Authentication Not Configured</p>
        <p className="mt-2 text-gray-600">Check your Firebase configuration in `/lib/firebase.js`.</p>
      </div>
    )
  }

  // Show loading until auth state is determined
  if (loading || !authReady) {
    return <ArcLoader />
  }

  // Render children once ready
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

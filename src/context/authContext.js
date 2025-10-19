"use client"
// src/context/authContext.js - UPDATED VERSION
import React, {createContext, useContext, useState, useEffect, useMemo} from "react"
import {getAuth, onAuthStateChanged, signInAnonymously, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile} from "firebase/auth"
import {initializeApp, getApps, getApp} from "firebase/app"

const firebaseConfig = {
  apiKey: "AIzaSyCkM8pNDAaGI4CNoYgd2oOMLVX4b_J8evc",
  authDomain: "crestblog001.firebaseapp.com",
  projectId: "crestblog001",
  storageBucket: "crestblog001.firebasestorage.app",
  messagingSenderId: "863786997689",
  appId: "1:863786997689:web:de19088d2b18236ff60868",
}

let firebaseApp
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
} else {
  firebaseApp = getApp()
}

const auth = getAuth(firebaseApp)

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

// Helper function to sync verification status with MongoDB
const syncVerificationStatus = async user => {
  try {
    await fetch("/api/user/sync-verification", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        uid: user.uid,
        emailVerified: user.emailVerified,
      }),
    })
  } catch (err) {
    console.error("Error syncing verification:", err)
  }
}

export const AuthProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      // Refresh user to get latest emailVerified status
      if (user && !user.isAnonymous) {
        await user.reload()
        const refreshedUser = auth.currentUser

        // Sync verification status with MongoDB
        await syncVerificationStatus(refreshedUser)

        setCurrentUser(refreshedUser)
      } else {
        setCurrentUser(user)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    if (name) {
      await updateProfile(userCredential.user, {displayName: name})
    }

    // Send verification email
    await sendEmailVerification(userCredential.user)
    console.log("📧 Verification email sent to:", email)

    // Sign out to force verification
    await signOut(auth)

    return userCredential
  }

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // Force reload to get latest verification status
    await userCredential.user.reload()

    if (!userCredential.user.emailVerified) {
      await signOut(auth)
      throw new Error("Please verify your email before logging in.")
    }

    // Sync verification status with MongoDB
    await syncVerificationStatus(userCredential.user)

    return userCredential
  }

  const logout = () => signOut(auth)

  const resendVerificationEmail = async () => {
    if (!currentUser) throw new Error("No user logged in")
    await sendEmailVerification(currentUser)
  }

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      signup,
      login,
      logout,
      resendVerificationEmail,
    }),
    [currentUser, loading]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

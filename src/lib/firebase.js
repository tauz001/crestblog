//src/lib/firebase.js

import {initializeApp, getApps, getApp} from "firebase/app"
import {getAnalytics} from "firebase/analytics"
import {getAuth} from "firebase/auth"

const NEXT_PUBLIC_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
const NEXT_PUBLIC_FIREBASE_DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
const NEXT_PUBLIC_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
const NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
const NEXT_PUBLIC_FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID
const NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// --- CORE FIX: Initialize the App only once ---
let app
if (!getApps().length) {
  // If no Firebase apps are running, initialize a new one.
  app = initializeApp(firebaseConfig)

  // Check for window/browser environment before initializing analytics (optional)
  if (typeof window !== "undefined" && app.name && app.options.measurementId) {
    getAnalytics(app)
  }
} else {
  // If an app is already initialized (e.g., during fast refresh), use it.
  app = getApp()
}

// Initialize Services and EXPORT THEM for project-wide use
export const auth = getAuth(app)
// export const db = getFirestore(app); // Uncomment this if you add Firestore

export default app

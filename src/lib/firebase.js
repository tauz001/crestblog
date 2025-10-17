//src/lib/firebase.js

import {initializeApp, getApps, getApp} from "firebase/app"
import {getAnalytics} from "firebase/analytics"
import {getAuth} from "firebase/auth"

// Your web app's Firebase configuration
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

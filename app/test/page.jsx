const signup = async (email, password, name) => {
  console.log("🚀 Starting signup process...")
  
  try {
    console.log("1️⃣ Creating user account...")
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    console.log("✅ User created:", cred.user.uid)
    
    if (name) {
      console.log("2️⃣ Updating profile...")
      await updateProfile(cred.user, { displayName: name })
      console.log("✅ Profile updated")
    }
    
    console.log("3️⃣ Sending verification email...")
    await sendEmailVerification(cred.user)
    console.log("✅ Email sent to:", email)
    
    console.log("4️⃣ Signing out user...")
    await signOut(auth)
    console.log("✅ User signed out")
    
    return cred
  } catch (error) {
    console.error("❌ Signup failed:", error.code, error.message)
    throw error
  }
}
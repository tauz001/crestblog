// /app/login/page.js (or /pages/login.js)

import AuthForms from "@/app/components/auth/AuthForm"

export const metadata = {
  title: "Login | CrestBlog",
  description: "Sign up or log in to CrestBlog.",
}

// This page uses the AuthForms component which handles the logic internally
export default function LoginPage() {
  return <AuthForms />
}

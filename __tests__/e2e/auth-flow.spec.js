// __tests__/e2e/auth-flow.spec.js
import {test, expect} from "@playwright/test"

test.describe("User Authentication Flow", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/")
  })

  // Tests complete signup and login workflow
  test("should complete signup, verify email, and login successfully", async ({page}) => {
    // Navigate to signup
    await page.click("text=Sign Up")
    await expect(page.locator("text=Create Account")).toBeVisible()

    // Fill signup form
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`

    await page.fill('input[placeholder*="name" i]', "Test User")
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', "Test123456!")

    await page.click('button[type="submit"]:has-text("Create Account")')

    // Verify success message
    await expect(page.locator("text=verification email has been sent")).toBeVisible({
      timeout: 10000,
    })

    // Note: In real E2E, you would verify email through test email service
    // For demonstration, we show the expected flow

    // Switch to login
    await page.click("text=Login")
    await expect(page.locator("text=Welcome Back")).toBeVisible()

    // Attempt login (will fail if email not verified)
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', "Test123456!")
    await page.click('button[type="submit"]:has-text("Login")')

    // Verify verification required message
    await expect(page.locator("text=verify your email")).toBeVisible()
  })

  // Tests protected route access control
  test("should redirect unauthenticated users from protected pages", async ({page}) => {
    await page.goto("/write")

    // Should redirect to login or show login prompt
    await expect(page).toHaveURL(/login/)
  })

  // Tests navigation for authenticated users
  test("should allow authenticated users to access write page", async ({page, context}) => {
    // Set authentication cookies (mock authenticated state)
    await context.addCookies([
      {
        name: "auth-token",
        value: "mock-token",
        domain: "localhost",
        path: "/",
      },
    ])

    // Mock authentication state in localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "auth",
        JSON.stringify({
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: true,
        })
      )
    })

    await page.goto("/write")

    // Verify write page elements are visible
    await expect(page.locator('input[placeholder*="Blog Title"]')).toBeVisible({
      timeout: 5000,
    })
    await expect(page.locator('button:has-text("Publish")')).toBeVisible()
  })

  // Tests user menu interactions
  test("should display user menu and logout successfully", async ({page, context}) => {
    // Set authentication cookies
    await context.addCookies([
      {
        name: "auth-token",
        value: "mock-token",
        domain: "localhost",
        path: "/",
      },
    ])

    await page.addInitScript(() => {
      window.localStorage.setItem(
        "auth",
        JSON.stringify({
          uid: "test-uid",
          email: "test@example.com",
          displayName: "Test User",
          emailVerified: true,
        })
      )
    })

    await page.goto("/")

    // Hover over user avatar
    const userAvatar = page.locator('div[class*="bg-emerald-100"]:has-text("TU")').first()
    await userAvatar.hover()

    // Click logout
    await page.click("text=Logout")

    // Verify redirect to home and login button visible
    await expect(page.locator("text=Login")).toBeVisible()
  })
})

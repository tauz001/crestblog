import {test, expect} from "@playwright/test"

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("http://localhost:3000")
  })

  test("user can sign up successfully", async ({page}) => {
    // Click Sign Up button
    await page.click("text=Sign Up")

    // Fill signup form
    await page.fill('input[placeholder="John Doe"]', "Test User")
    await page.fill('input[placeholder="your@email.com"]', "test@example.com")
    await page.fill('input[placeholder="••••••••"]', "password123")

    // Submit form
    await page.click('button:has-text("Create Account")')

    // Should show success message
    await expect(page.locator("text=Account created!")).toBeVisible()
    await expect(page.locator("text=Please check your email")).toBeVisible()
  })

  test("user can login successfully", async ({page}) => {
    // Click Login button
    await page.click("text=Login")

    // Fill login form
    await page.fill('input[type="email"]', "existing@example.com")
    await page.fill('input[type="password"]', "correctpassword")

    // Submit
    await page.click('button:has-text("Login")')

    // Should redirect to homepage with user menu
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible()
    await expect(page).toHaveURL("http://localhost:3000/")
  })

  test("shows error for invalid credentials", async ({page}) => {
    await page.click("text=Login")

    await page.fill('input[type="email"]', "wrong@example.com")
    await page.fill('input[type="password"]', "wrongpassword")
    await page.click('button:has-text("Login")')

    // Should show error
    await expect(page.locator("text=Failed to login")).toBeVisible()
  })

  test("user can logout", async ({page}) => {
    // Login first
    await page.click("text=Login")
    await page.fill('input[type="email"]', "existing@example.com")
    await page.fill('input[type="password"]', "correctpassword")
    await page.click('button:has-text("Login")')

    // Hover over user avatar
    await page.hover('[data-testid="user-avatar"]')

    // Click logout
    await page.click("text=Logout")

    // Should redirect to home and show login button
    await expect(page.locator("text=Login")).toBeVisible()
  })
})

test.describe("Blog Creation Flow", () => {
  test("authenticated user can create a blog post", async ({page}) => {
    // Login first
    await page.goto("http://localhost:3000/login")
    await page.fill('input[type="email"]', "author@example.com")
    await page.fill('input[type="password"]', "password123")
    await page.click('button:has-text("Login")')

    // Navigate to write page
    await page.click("text=Write")

    // Fill blog form
    await page.fill('input[placeholder="Enter your blog title..."]', "My Test Blog Post")
    await page.selectOption("select", "Technology")
    await page.fill('input[placeholder="Write a one-line summary..."]', "This is a test summary")

    // Add content section
    await page.click("text=Add New Content Section")
    await page.fill('input[placeholder="Enter sub heading..."]', "Introduction")
    await page.fill('textarea[placeholder="Write your content here..."]', "This is the content of my blog post.")
    await page.click('button:has-text("Save Section")')

    // Publish
    await page.click('button:has-text("Publish")')

    // Should show success and redirect
    await expect(page.locator("text=Blog published successfully!")).toBeVisible()
  })
})

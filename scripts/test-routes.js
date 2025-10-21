// scripts/test-routes.js
// Run with: node scripts/test-routes.js
// Make sure your dev server is running on http://localhost:3000

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

// ANSI color codes for better output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

const log = {
  success: msg => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: msg => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
}

// Test results tracker
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
}

// Helper function to make requests
async function testRequest(method, url, options = {}) {
  results.total++
  const fullUrl = `${BASE_URL}${url}`

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const data = await response.text()
    let jsonData = null

    try {
      jsonData = JSON.parse(data)
    } catch {
      // Not JSON response
    }

    const testResult = {
      method,
      url,
      status: response.status,
      success: options.expectedStatus ? response.status === options.expectedStatus : response.status >= 200 && response.status < 400,
      data: jsonData,
      raw: data.substring(0, 200), // First 200 chars
    }

    if (testResult.success) {
      results.passed++
      log.success(`${method} ${url} - ${response.status}`)
    } else {
      results.failed++
      log.error(`${method} ${url} - ${response.status}`)
      if (options.expectedStatus) {
        log.warning(`  Expected: ${options.expectedStatus}, Got: ${response.status}`)
      }
    }

    results.tests.push(testResult)
    return testResult
  } catch (error) {
    results.failed++
    log.error(`${method} ${url} - ${error.message}`)
    results.tests.push({
      method,
      url,
      error: error.message,
      success: false,
    })
    return {success: false, error: error.message}
  }
}

// Test suites
async function testPublicPages() {
  log.section("📄 Testing Public Pages")

  await testRequest("GET", "/")
  await testRequest("GET", "/aboutus")
  await testRequest("GET", "/blogs")
  await testRequest("GET", "/login")
  await testRequest("GET", "/not-found", {expectedStatus: 404})
}

async function testAPIRoutes() {
  log.section("🔌 Testing API Routes")

  // User API
  log.info("Testing User API...")
  await testRequest("GET", "/api/user")
  await testRequest("GET", "/api/user?uid=test-uid")

  // Publish API
  log.info("Testing Publish API...")
  const publishResult = await testRequest("GET", "/api/publish")

  if (publishResult.success && publishResult.data?.data?.length > 0) {
    const firstPostId = publishResult.data.data[0]._id
    log.info(`Testing specific post: ${firstPostId}`)
    await testRequest("GET", `/api/publish/${firstPostId}`)
  } else {
    log.warning("No posts found to test individual post route")
  }

  // Test POST to publish (will fail without auth, but tests route exists)
  await testRequest("POST", "/api/publish", {
    expectedStatus: 400, // Expected to fail without proper data
    body: {},
  })
}

async function testAuthRoutes() {
  log.section("🔐 Testing Auth Routes")

  await testRequest("GET", "/api/user/followers?uid=test-uid")
  await testRequest("GET", "/api/user/following?uid=test-uid")
  await testRequest("GET", "/api/user/interactions?uid=test-uid")

  // These will fail without auth but test route existence
  await testRequest("POST", "/api/user/follow", {
    body: {
      currentUserUid: "test1",
      targetUserUid: "test2",
      action: "follow",
    },
  })

  await testRequest("POST", "/api/user/interactions", {
    body: {
      uid: "test-uid",
      action: "like",
      targetId: "test-post-id",
    },
  })
}

async function testProtectedPages() {
  log.section("🔒 Testing Protected Pages (Will redirect if not authenticated)")

  await testRequest("GET", "/write")
  await testRequest("GET", "/profile/edit")
  await testRequest("GET", "/profile/test-uid")
  await testRequest("GET", "/update/test-post-id")
}

async function testBlogDetailsPages() {
  log.section("📝 Testing Blog Details Pages")

  // First get a real post ID
  const publishResult = await testRequest("GET", "/api/publish")

  if (publishResult.success && publishResult.data?.data?.length > 0) {
    const posts = publishResult.data.data.slice(0, 3) // Test first 3 posts

    for (const post of posts) {
      await testRequest("GET", `/blogs/blog_details/${post._id}`)
    }
  } else {
    log.warning("No posts found to test blog details pages")
  }
}

async function testEdgeCases() {
  log.section("⚠️ Testing Edge Cases")

  // Invalid IDs
  await testRequest("GET", "/api/publish/invalid-id")
  await testRequest("GET", "/blogs/blog_details/invalid-id")
  await testRequest("GET", "/profile/invalid-uid")

  // Missing parameters
  await testRequest("GET", "/api/user/followers")
  await testRequest("GET", "/api/user/interactions")

  // Invalid methods
  await testRequest("PATCH", "/api/publish", {expectedStatus: 405})
}

async function testDatabaseConnection() {
  log.section("💾 Testing Database Connection")

  const userResult = await testRequest("GET", "/api/user")
  const postResult = await testRequest("GET", "/api/publish")

  if (userResult.success && postResult.success) {
    log.success("Database connection working")

    if (userResult.data?.data) {
      log.info(`Found ${userResult.data.data.length} users`)
    }

    if (postResult.data?.data) {
      log.info(`Found ${postResult.data.data.length} posts`)
    }
  } else {
    log.error("Database connection might have issues")
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}  CrestBlog Route Testing Utility${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}\n`)

  log.info(`Testing against: ${BASE_URL}`)
  log.info(`Make sure your dev server is running!\n`)

  const startTime = Date.now()

  try {
    await testDatabaseConnection()
    await testPublicPages()
    await testAPIRoutes()
    await testAuthRoutes()
    await testProtectedPages()
    await testBlogDetailsPages()
    await testEdgeCases()
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`)
  }

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  // Print summary
  console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}  Test Summary${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}\n`)

  console.log(`Total Tests:    ${results.total}`)
  console.log(`${colors.green}Passed:${colors.reset}         ${results.passed}`)
  console.log(`${colors.red}Failed:${colors.reset}         ${results.failed}`)
  console.log(`Duration:       ${duration}s\n`)

  const passRate = ((results.passed / results.total) * 100).toFixed(1)

  if (passRate >= 80) {
    log.success(`Success Rate: ${passRate}% - Great job! 🎉`)
  } else if (passRate >= 60) {
    log.warning(`Success Rate: ${passRate}% - Needs attention ⚠️`)
  } else {
    log.error(`Success Rate: ${passRate}% - Critical issues! 🚨`)
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    duration: `${duration}s`,
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      passRate: `${passRate}%`,
    },
    tests: results.tests,
  }

  const fs = require("fs")
  const reportPath = "./test-report.json"

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    log.info(`\nDetailed report saved to: ${reportPath}`)
  } catch (error) {
    log.warning(`Could not save report: ${error.message}`)
  }

  console.log("\n")

  // Exit with error code if tests failed
  process.exit(results.failed > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch(error => {
  log.error(`Fatal error: ${error.message}`)
  process.exit(1)
})

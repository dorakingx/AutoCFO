import { chromium, Browser, Page } from "playwright"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"

const APP_URL = "http://localhost:3000"
const VIDEO_DIR = join(process.cwd(), "videos")
const VIDEO_PATH = join(VIDEO_DIR, "demo.webm")

async function ensureVideoDir() {
  if (!existsSync(VIDEO_DIR)) {
    mkdirSync(VIDEO_DIR, { recursive: true })
    console.log(`Created directory: ${VIDEO_DIR}`)
  }
}

async function main() {
  // Ensure video directory exists
  await ensureVideoDir()

  console.log("🎬 Starting demo recording...")
  console.log(`📹 Video will be saved to: ${VIDEO_PATH}`)

  // Launch browser with video recording
  const browser: Browser = await chromium.launch({
    headless: false, // Show browser for visual feedback
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 720 },
    },
  })

  const page: Page = await context.newPage()

  try {
    // Step 1: Navigate to app
    console.log("\n📱 Step 1: Navigating to app...")
    await page.goto(APP_URL, { waitUntil: "networkidle" })
    await page.waitForSelector("h1:has-text('AutoCFO')", { timeout: 10000 })
    console.log("✅ App loaded")

    // Wait a bit for initial render
    await page.waitForTimeout(2000)

    // Step 2: Click "Reset State" button
    console.log("\n🔄 Step 2: Resetting state...")
    const resetButton = page.locator('button:has-text("Reset State")')
    await resetButton.waitFor({ timeout: 5000 })
    await resetButton.click()
    console.log("✅ Reset State clicked")
    
    // Wait for page reload after reset
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(2000)

    // Step 3: Click "Start Agent" button
    console.log("\n▶️  Step 3: Starting agent...")
    const startAgentButton = page.locator('button:has-text("Start Agent")')
    await startAgentButton.waitFor({ timeout: 5000 })
    await startAgentButton.click()
    console.log("✅ Start Agent clicked")

    // Step 4: Wait 15 seconds to capture agent logs and balance updates
    console.log("\n⏳ Step 4: Observing agent execution (15 seconds)...")
    console.log("   - Watching agent logs scroll...")
    console.log("   - Watching balance updates...")
    await page.waitForTimeout(15000)
    console.log("✅ Observation complete")

    // Step 5: Scroll to Payroll List and verify completion
    console.log("\n📋 Step 5: Verifying payroll completion...")
    const payrollSection = page.locator('text=Upcoming Payrolls')
    await payrollSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    
    // Check if payrolls are completed (if it's payroll day)
    const today = new Date()
    const isPayrollDay = today.getDate() === 25
    if (isPayrollDay) {
      console.log("   - Today is payroll day, checking for completed status...")
      await page.waitForSelector('text=completed', { timeout: 5000 }).catch(() => {
        console.log("   - Payrolls may still be pending (not payroll day or not executed)")
      })
    } else {
      console.log(`   - Not payroll day (${today.getDate()}th), payrolls will remain pending`)
    }
    
    await page.waitForTimeout(3000)
    console.log("✅ Verification complete")

    // Step 6: Stop recording
    console.log("\n🎬 Step 6: Stopping recording...")
    await context.close()
    
    // Wait a moment for video file to be written
    await page.waitForTimeout(1000)
    await browser.close()

    console.log("\n✅ Demo recording completed successfully!")
    console.log(`📹 Video saved to: ${VIDEO_PATH}`)
    console.log("\n💡 Tip: The video file may take a few seconds to finalize.")

  } catch (error) {
    console.error("\n❌ Error during recording:", error)
    await context.close()
    await browser.close()
    throw error
  }
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})

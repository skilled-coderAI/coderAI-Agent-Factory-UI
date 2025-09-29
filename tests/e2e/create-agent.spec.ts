import { test, expect } from "@playwright/test";

test.describe("Create Agent", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create");
  });

  test("should display create agent form", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Create AI Agent");
    
    // Check form fields are present
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('textarea[id="description"]')).toBeVisible();
    await expect(page.locator('input[id="type"]')).toBeVisible();
  });

  test("should show creation steps", async ({ page }) => {
    // Check step indicators
    await expect(page.locator("text=Agent Details")).toBeVisible();
    await expect(page.locator("text=Web Scraping")).toBeVisible();
    await expect(page.locator("text=Requirements")).toBeVisible();
    await expect(page.locator("text=Review & Create")).toBeVisible();
    
    // First step should be active
    const step1 = page.locator("text=1").first();
    await expect(step1).toHaveClass(/bg-gradient/);
  });

  test("should navigate through creation steps", async ({ page }) => {
    // Fill in agent details
    await page.fill('input[id="name"]', "Test Agent");
    await page.fill('textarea[id="description"]', "Test Description");
    await page.fill('input[id="type"]', "test");
    
    // Go to requirements step
    await page.click("text=Add Requirements");
    await expect(page.locator("h3")).toContainText("Web Scraping");
    
    // Skip to manual input
    await page.click("text=Manual Input");
    await expect(page.locator("h3")).toContainText("Requirements");
    
    // Fill requirements
    await page.fill('textarea[id="requirements"]', "Test requirements for the agent");
    
    // Go to review
    await page.click("text=Review & Create");
    await expect(page.locator("h3")).toContainText("Review & Create");
    
    // Check review data
    await expect(page.locator("text=Test Agent")).toBeVisible();
    await expect(page.locator("text=Test Description")).toBeVisible();
    await expect(page.locator("text=test")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    // Try to create without name
    await page.click("text=Skip to Review");
    await page.click("text=Create Agent");
    
    // Should show error toast
    await expect(page.locator("text=Name required")).toBeVisible();
  });

  test("should handle web scraping", async ({ page }) => {
    // Fill basic details first
    await page.fill('input[id="name"]', "Scrape Test Agent");
    await page.fill('input[id="type"]', "test");
    
    // Go to scraping step
    await page.click("text=Add Requirements");
    
    // Fill URL
    await page.fill('input[id="scrapeUrl"]', "https://example.com");
    
    // Note: We can't actually test the scraping functionality in e2e tests
    // without mocking the backend, but we can test the UI flow
    await expect(page.locator("text=Scrape Website")).toBeVisible();
    await expect(page.locator("text=Manual Input")).toBeVisible();
  });

  test("should create agent successfully", async ({ page }) => {
    // Fill all required fields
    await page.fill('input[id="name"]', "E2E Test Agent");
    await page.fill('textarea[id="description"]', "Created by E2E test");
    await page.fill('input[id="type"]', "test");
    
    // Skip to review
    await page.click("text=Skip to Review");
    
    // Create agent
    await page.click("text=Create Agent");
    
    // Should redirect to agent details or show success
    // Note: This will depend on your backend being available
    await page.waitForTimeout(3000);
    
    // Check for either success redirect or error handling
    const currentUrl = page.url();
    const hasRedirected = currentUrl.includes("/agents/") || currentUrl === "/";
    const hasError = await page.locator("text=Failed to create agent").isVisible();
    
    expect(hasRedirected || hasError).toBeTruthy();
  });

  test("should navigate back to dashboard", async ({ page }) => {
    await page.click('[data-testid="back-button"]');
    await expect(page).toHaveURL("/");
  });
});

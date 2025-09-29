import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate between all main pages", async ({ page }) => {
    // Start at dashboard
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Dashboard");
    
    // Navigate to templates
    await page.click('nav a[href="/templates"]');
    await expect(page).toHaveURL("/templates");
    await expect(page.locator("h1")).toContainText("Agent Templates");
    
    // Navigate to analytics
    await page.click('nav a[href="/analytics"]');
    await expect(page).toHaveURL("/analytics");
    await expect(page.locator("h1")).toContainText("Analytics");
    
    // Navigate to create agent
    await page.click('a[href="/create"]');
    await expect(page).toHaveURL("/create");
    await expect(page.locator("h1")).toContainText("Create AI Agent");
    
    // Navigate back to dashboard
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("should highlight active navigation item", async ({ page }) => {
    // Check dashboard is active
    await page.goto("/");
    const dashboardLink = page.locator('nav a[href="/"]');
    await expect(dashboardLink).toHaveClass(/bg-gradient/);
    
    // Check templates is active
    await page.goto("/templates");
    const templatesLink = page.locator('nav a[href="/templates"]');
    await expect(templatesLink).toHaveClass(/bg-gradient/);
    
    // Check analytics is active
    await page.goto("/analytics");
    const analyticsLink = page.locator('nav a[href="/analytics"]');
    await expect(analyticsLink).toHaveClass(/bg-gradient/);
  });

  test("should display header with logo and navigation", async ({ page }) => {
    await page.goto("/");
    
    // Check header elements
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("text=CoderAI")).toBeVisible();
    await expect(page.locator('a[href="/create"]')).toContainText("Create Agent");
  });

  test("should display sidebar navigation", async ({ page }) => {
    await page.goto("/");
    
    // Check sidebar is visible
    await expect(page.locator("nav")).toBeVisible();
    
    // Check all navigation items
    await expect(page.locator('nav a[href="/"]')).toContainText("Dashboard");
    await expect(page.locator('nav a[href="/templates"]')).toContainText("Templates");
    await expect(page.locator('nav a[href="/analytics"]')).toContainText("Analytics");
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    await page.goto("/non-existent-page");
    
    // Should either redirect to dashboard or show 404
    // This depends on your routing configuration
    const currentUrl = page.url();
    expect(currentUrl.endsWith("/") || currentUrl.includes("404")).toBeTruthy();
  });
});

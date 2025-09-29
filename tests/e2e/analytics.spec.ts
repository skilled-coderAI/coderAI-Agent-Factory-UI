import { test, expect } from "@playwright/test";

test.describe("Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/analytics");
  });

  test("should display analytics page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Analytics");
  });

  test("should display analytics cards", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Check main statistics cards
    await expect(page.locator("text=Total Agents")).toBeVisible();
    await expect(page.locator("text=Active Agents")).toBeVisible();
    await expect(page.locator("text=Processing")).toBeVisible();
    await expect(page.locator("text=Success Rate")).toBeVisible();
  });

  test("should display charts and breakdowns", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Check for chart sections
    await expect(page.locator("text=Agents by Type")).toBeVisible();
    await expect(page.locator("text=Agent Status Overview")).toBeVisible();
    await expect(page.locator("text=Recent Activity")).toBeVisible();
  });

  test("should show agent type distribution", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const agentTypeSection = page.locator("text=Agents by Type").locator("..");
    
    // Should either show data or empty state
    const hasData = await agentTypeSection.locator(".bg-slate-900\\/50").count() > 0;
    const hasEmptyState = await agentTypeSection.locator("text=No agents created yet").isVisible();
    
    expect(hasData || hasEmptyState).toBeTruthy();
  });

  test("should show status overview with progress bars", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const statusSection = page.locator("text=Agent Status Overview").locator("..");
    
    // Check for status categories
    await expect(statusSection.locator("text=Ready")).toBeVisible();
    await expect(statusSection.locator("text=Processing")).toBeVisible();
    await expect(statusSection.locator("text=Error")).toBeVisible();
  });

  test("should display recent activity", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const activitySection = page.locator("text=Recent Activity").locator("..");
    
    // Should either show activity items or empty state
    const hasActivity = await activitySection.locator(".bg-slate-900\\/50").count() > 0;
    const hasEmptyState = await activitySection.locator("text=No recent activity").isVisible();
    
    expect(hasActivity || hasEmptyState).toBeTruthy();
  });

  test("should show correct statistics format", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Check that statistics are displayed as numbers
    const totalAgentsCard = page.locator("text=Total Agents").locator("..");
    const totalValue = await totalAgentsCard.locator(".text-2xl").textContent();
    
    if (totalValue) {
      expect(totalValue.trim()).toMatch(/^\d+$/); // Should be a number
    }
    
    // Check success rate is a percentage
    const successRateCard = page.locator("text=Success Rate").locator("..");
    const successValue = await successRateCard.locator(".text-2xl").textContent();
    
    if (successValue) {
      expect(successValue.trim()).toMatch(/^\d+%$/); // Should be a percentage
    }
  });
});

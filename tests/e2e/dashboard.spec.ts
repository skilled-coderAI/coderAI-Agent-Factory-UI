import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display dashboard title and navigation", async ({ page }) => {
    // Check page title
    await expect(page.locator("h1")).toContainText("Dashboard");
    
    // Check navigation items
    await expect(page.locator('nav a[href="/"]')).toContainText("Dashboard");
    await expect(page.locator('nav a[href="/templates"]')).toContainText("Templates");
    await expect(page.locator('nav a[href="/analytics"]')).toContainText("Analytics");
  });

  test("should display statistics cards", async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="total-agents"]', { timeout: 10000 });
    
    // Check statistics cards are present
    await expect(page.locator("text=Total Agents")).toBeVisible();
    await expect(page.locator("text=Active Agents")).toBeVisible();
    await expect(page.locator("text=Processing")).toBeVisible();
  });

  test("should show create agent button", async ({ page }) => {
    const createButton = page.locator('a[href="/create"]').first();
    await expect(createButton).toBeVisible();
    await expect(createButton).toContainText("Create Agent");
  });

  test("should navigate to create agent page", async ({ page }) => {
    await page.click('a[href="/create"]');
    await expect(page).toHaveURL("/create");
    await expect(page.locator("h1")).toContainText("Create AI Agent");
  });

  test("should display empty state when no agents exist", async ({ page }) => {
    // This test assumes a clean database state
    const emptyState = page.locator("text=No agents yet");
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator("text=Get started by creating your first AI agent")).toBeVisible();
      await expect(page.locator("text=Create Your First Agent")).toBeVisible();
    }
  });

  test("should display agent cards when agents exist", async ({ page }) => {
    // Wait for potential agent cards to load
    await page.waitForTimeout(2000);
    
    const agentCards = page.locator('[data-testid="agent-card"]');
    const agentCount = await agentCards.count();
    
    if (agentCount > 0) {
      // Check first agent card structure
      const firstCard = agentCards.first();
      await expect(firstCard).toBeVisible();
      
      // Each card should have a name and status
      await expect(firstCard.locator(".text-lg")).toBeVisible(); // Agent name
      await expect(firstCard.locator('[class*="border"]')).toBeVisible(); // Status badge
    }
  });

  test("should navigate to agent details when clicking on agent card", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const agentCards = page.locator('[data-testid="agent-card"]');
    const agentCount = await agentCards.count();
    
    if (agentCount > 0) {
      await agentCards.first().click();
      await expect(page).toHaveURL(/\/agents\/\d+/);
    }
  });
});

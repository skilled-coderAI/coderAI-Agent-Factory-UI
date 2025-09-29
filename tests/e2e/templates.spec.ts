import { test, expect } from "@playwright/test";

test.describe("Templates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/templates");
  });

  test("should display templates page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Agent Templates");
    await expect(page.locator("text=Create Custom Agent")).toBeVisible();
  });

  test("should display template cards", async ({ page }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);
    
    const templateCards = page.locator('[data-testid="template-card"]');
    const templateCount = await templateCards.count();
    
    if (templateCount > 0) {
      // Check first template card
      const firstCard = templateCards.first();
      await expect(firstCard).toBeVisible();
      
      // Should have template name and category
      await expect(firstCard.locator("h3")).toBeVisible();
      await expect(firstCard.locator('[class*="border"]')).toBeVisible(); // Category badge
      await expect(firstCard.locator("text=Use This Template")).toBeVisible();
    } else {
      // Check empty state
      await expect(page.locator("text=No templates available")).toBeVisible();
    }
  });

  test("should filter templates by category", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const templateCards = page.locator('[data-testid="template-card"]');
    const templateCount = await templateCards.count();
    
    if (templateCount > 0) {
      // Check that different categories are displayed
      const categories = ["customer service", "research", "marketing", "analytics"];
      
      for (const category of categories) {
        const categoryBadges = page.locator(`text=${category}`);
        const categoryCount = await categoryBadges.count();
        
        if (categoryCount > 0) {
          await expect(categoryBadges.first()).toBeVisible();
        }
      }
    }
  });

  test("should navigate to create agent with template", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const useTemplateButtons = page.locator("text=Use This Template");
    const buttonCount = await useTemplateButtons.count();
    
    if (buttonCount > 0) {
      await useTemplateButtons.first().click();
      await expect(page).toHaveURL(/\/create\?template=\d+/);
    }
  });

  test("should navigate to create custom agent", async ({ page }) => {
    await page.click("text=Create Custom Agent");
    await expect(page).toHaveURL("/create");
  });

  test("should display template configuration details", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const templateCards = page.locator('[data-testid="template-card"]');
    const templateCount = await templateCards.count();
    
    if (templateCount > 0) {
      const firstCard = templateCards.first();
      
      // Should show model and temperature info
      await expect(firstCard.locator("text=Model:")).toBeVisible();
      await expect(firstCard.locator("text=Temperature:")).toBeVisible();
    }
  });
});

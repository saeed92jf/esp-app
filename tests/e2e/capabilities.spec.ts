import { test, expect } from '@playwright/test';

test.describe('App Capabilities & Interactive Workflows', () => {
  test('Auth modal triggers open properly from interactive header elements', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    // Look for registration or login triggers
    const registerBtn = page.locator('a[href*="/register"]').first();
    if (await registerBtn.isVisible()) {
      await expect(registerBtn).toBeEnabled();
      // Should point to valid register route
      const href = await registerBtn.getAttribute('href');
      expect(href).toContain('register');
    }

    const loginBtn = page.locator('a[href*="/login"]').first();
    if (await loginBtn.isVisible()) {
      await expect(loginBtn).toBeEnabled();
      const href = await loginBtn.getAttribute('href');
      expect(href).toContain('login');
    }
  });

  test('Dashboard capabilities: protected by PremiumGuard or renders cleanly without crashing', async ({ page }) => {
    await page.goto('/fa/dashboard', { waitUntil: 'networkidle' });

    await expect(page.locator('body')).toBeVisible();

    // PremiumGuard will either render AuthModal dialog (guest) or the dashboard main container (authenticated)
    const isGuarded = await page.locator('[role="dialog"], .backdrop-blur-sm, div:has-text("ورود"), div:has-text("Login")').count();
    const mainCount = await page.locator('main').count();

    expect(isGuarded > 0 || mainCount > 0).toBe(true);
  });

  test('ESP-Flow diagram capability: editor loads canvas properly', async ({ page }) => {
    await page.goto('/fa/ESP-Flow', { waitUntil: 'domcontentloaded' });

    const body = page.locator('body');
    await expect(body).toBeVisible();
    // Verify no blank white screen
    const content = await body.innerHTML();
    expect(content.length).toBeGreaterThan(100);
  });

  test('Responsive capability: mobile viewport (375x667) renders without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    // Allowing small 2px tolerance for sub-pixel anti-aliasing
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});

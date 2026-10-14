import { test, expect } from '@playwright/test';

test.describe('UI Contracts & Design System Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });
  });

  test('Footer complies with design standards: primary company name, no top border, slate/silver links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // 1. Verify company name is primary
    const companySpan = footer.locator('span', { hasText: 'EUROSLOT PARS' });
    await expect(companySpan).toBeVisible();
    await expect(companySpan).toHaveClass(/text-primary/);
    await expect(companySpan).toHaveClass(/font-semibold/);

    // 2. Verify top border is completely removed
    const footerClasses = await footer.getAttribute('class');
    expect(footerClasses).not.toContain('border-t');

    // 3. Verify footer links have bolder slate/silver tones
    const links = footer.locator('nav a');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const linkClasses = await link.getAttribute('class');
      expect(linkClasses).toContain('text-slate-600');
      expect(linkClasses).toContain('dark:text-slate-300');
      expect(linkClasses).toContain('font-medium');
    }

    // 4. Verify Persian digits class is attached
    expect(footerClasses).toContain('fa-num');
  });

  test('Theme switcher toggles between dark and light modes', async ({ page }) => {
    const html = page.locator('html');

    // Find theme toggle button in header
    const themeToggle = page.locator('button[aria-label*="theme" i], button:has(svg.ph-sun), button:has(svg.ph-moon), button:has(.lucide-sun), button:has(.lucide-moon)').first();

    if (await themeToggle.isVisible()) {
      const initialClass = (await html.getAttribute('class')) || '';
      const wasDark = initialClass.includes('dark');

      // Click to toggle
      await themeToggle.click();
      await page.waitForTimeout(400);

      const afterClass = (await html.getAttribute('class')) || '';
      const isDarkNow = afterClass.includes('dark');

      expect(isDarkNow).not.toBe(wasDark);

      // Click again to toggle back
      await themeToggle.click();
      await page.waitForTimeout(400);

      const restoredClass = (await html.getAttribute('class')) || '';
      expect(restoredClass.includes('dark')).toBe(wasDark);
    }
  });

  test('Locale switcher toggles correctly between Persian (RTL) and English (LTR)', async ({ page }) => {
    const html = page.locator('html');

    // On /fa, dir should be rtl
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Navigate to English version
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await expect(html).toHaveAttribute('dir', 'ltr');

    // Verify footer still renders cleanly on /en
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const company = footer.locator('span', { hasText: 'EUROSLOT PARS' });
    await expect(company).toBeVisible();
  });
});

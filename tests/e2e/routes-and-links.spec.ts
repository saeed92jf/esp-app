import { test, expect } from '@playwright/test';
import { discoverAppRoutes, extractNavigationLinks, getTestMatrix } from '../helpers/route-discovery';

test.describe('Automated Route Discovery & Health Audit', () => {
  const routes = discoverAppRoutes();
  const matrix = getTestMatrix(['fa', 'en']);

  test('Auto-discovery dynamically finds all application routes', () => {
    expect(routes.length).toBeGreaterThan(0);
    // Ensure core pages are detected
    const paths = routes.map((r) => r.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/plans');
    expect(paths).toContain('/privacy');
    expect(paths).toContain('/terms');
    expect(paths).toContain('/sitemap');
    expect(paths).toContain('/dashboard');
  });

  // Dynamically generated tests for every single route in the app!
  for (const item of matrix) {
    test(`Route [${item.locale}] "${item.route}" (${item.fullUrl}) loads with HTTP 200`, async ({ page }) => {
      // Listen for uncaught exceptions on the page
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      const response = await page.goto(item.fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 25_000,
      });

      // Verify response is OK
      expect(response).not.toBeNull();
      expect(response?.status()).toBeLessThan(400);

      // Verify page body exists and is visible
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Ensure no fatal runtime crashes occurred
      const fatalErrors = pageErrors.filter(
        (e) => !e.message.includes('Aparat') && !e.message.includes('WebGL') && !e.message.includes('ResizeObserver')
      );
      expect(fatalErrors).toHaveLength(0);
    });
  }
});

test.describe('Automated Link Crawler & Navigation Integrity', () => {
  test('All links in Homepage, Header, and Footer are valid and non-broken', async ({ page, request }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    // Collect all links on page
    const links = await page.locator('a[href]').evaluateAll((elements) =>
      elements
        .map((el) => el.getAttribute('href'))
        .filter((href): href is string => Boolean(href && !href.startsWith('#') && !href.startsWith('javascript:')))
    );

    const uniqueLinks = Array.from(new Set(links));
    expect(uniqueLinks.length).toBeGreaterThan(0);

    // Verify key internal links return 200/300
    for (const href of uniqueLinks) {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        // Skip external domains during local CI
        continue;
      }

      const res = await request.get(href);
      expect(res.status(), `Link "${href}" should not be broken (404/500)`).toBeLessThan(400);
    }
  });

  test('Navigation configuration items have valid declared routes', () => {
    const navItems = extractNavigationLinks();
    expect(navItems.length).toBeGreaterThan(0);

    for (const item of navItems) {
      expect(item.href).toBeTruthy();
      expect(item.href.startsWith('/')).toBe(true);
      expect(item.labelKey).toBeTruthy();
    }
  });

  test('Footer links navigate properly to privacy, terms, and sitemap', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const privacyLink = footer.locator('a[href*="/privacy"]');
    const termsLink = footer.locator('a[href*="/terms"]');
    const sitemapLink = footer.locator('a[href*="/sitemap"]');

    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();
    await expect(sitemapLink).toBeVisible();

    // Verify clicking privacy link navigates to privacy page
    await privacyLink.click();
    await page.waitForURL('**/privacy**');
    expect(page.url()).toContain('/privacy');
  });
});

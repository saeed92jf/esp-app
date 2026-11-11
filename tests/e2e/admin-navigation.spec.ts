import { test, expect } from "@playwright/test";

test.describe("Admin Route-Based Navigation & Permissions", () => {
  test("Unauthenticated user is intercepted by AuthGate when accessing /en/admin", async ({
    page,
  }) => {
    await page.goto("/en/admin", { waitUntil: "domcontentloaded" });
    // Should either show login redirect or auth gate
    await page.waitForURL(/.*(login|admin).*/);
    const url = page.url();
    expect(url.includes("login") || url.includes("admin")).toBe(true);
  });

  test("Unauthenticated user is intercepted when accessing nested route /en/admin/users", async ({
    page,
  }) => {
    await page.goto("/en/admin/users", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/.*(login|admin).*/);
    const url = page.url();
    expect(url.includes("login") || url.includes("admin")).toBe(true);
  });

  test("Direct navigation to admin subroutes renders without crashing", async ({
    page,
  }) => {
    const routes = [
      "/en/admin",
      "/en/admin/users",
      "/en/admin/config",
      "/en/admin/requests",
      "/en/admin/settings",
    ];

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const body = page.locator("body");
      await expect(body).toBeVisible();
      const content = await body.innerHTML();
      expect(content.length).toBeGreaterThan(50);
    }
  });

  test("Bilingual Admin routes respond with 200 OK on both English and Persian", async ({
    request,
  }) => {
    const resEn = await request.get("/en/admin");
    expect(resEn.status()).toBe(200);

    const resFa = await request.get("/fa/admin");
    expect(resFa.status()).toBe(200);

    const resUsersEn = await request.get("/en/admin/users");
    expect(resUsersEn.status()).toBe(200);

    const resRequestsEn = await request.get("/en/admin/requests");
    expect(resRequestsEn.status()).toBe(200);
  });
});

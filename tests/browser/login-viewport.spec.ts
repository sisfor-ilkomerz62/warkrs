import { test, expect } from "@playwright/test";

for (const [width, height] of [[320, 568], [375, 667], [390, 844], [768, 1024], [1440, 900]]) {
  test(`login fits ${width} × ${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Masuk ke War KRS" })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => ({
      horizontal: document.documentElement.scrollWidth > innerWidth,
      vertical: document.documentElement.scrollHeight > innerHeight,
    }))).toEqual({ horizontal: false, vertical: false });
    await expect(page.getByRole("link", { name: "Lupa kata sandi?" })).toBeInViewport();
    await page.setViewportSize({ width, height: 300 });
    await page.getByRole("button", { name: "Masuk ke War KRS" }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Masuk ke War KRS" })).toBeInViewport();
  });
}

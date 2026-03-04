import { expect, test } from "@playwright/test";

test("home -> primary actions visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "刷题" })).toBeVisible();
  await expect(page.getByRole("link", { name: "复习" })).toBeVisible();
  await expect(page.getByRole("link", { name: "设置" })).toBeVisible();
});

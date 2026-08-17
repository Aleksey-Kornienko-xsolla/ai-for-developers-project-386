import { test, expect } from "@playwright/test";

test.describe("US-4: Non-existent event type (404)", () => {
  test("shows error banner for unknown event type", async ({ page }) => {
    await page.goto("/booking/unknown-type");

    await expect(page.getByText("Тип события не найден")).toBeVisible();
    await expect(page.getByRole("button", { name: "Повторить" })).toBeVisible();
  });
});

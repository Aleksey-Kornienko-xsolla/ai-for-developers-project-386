import { test, expect } from "@playwright/test";
import { pickFirstSlot } from "../fixtures/ui";

test.describe("US-3: Idempotent booking retry", () => {
  test("retry with same Idempotency-Key returns 200 with same booking", async ({ page }) => {
    let firstCall = true;
    let firstResponseBody: { id: string } | null = null;

    await page.route("**/api/v1/event-types/*/bookings", async (route) => {
      if (firstCall) {
        firstCall = false;
        const response = await route.fetch();
        firstResponseBody = await response.json();
        await route.fulfill({
          status: 500,
          json: { status: 500, message: "Simulated network failure" },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/booking/intro-call");

    await pickFirstSlot(page);

    await page.getByLabel("Ваше имя").fill("Test User");
    await page.getByLabel("Email").fill("test-user@example.com");

    const firstResponsePromise = page.waitForResponse(
      (r) => r.url().includes("/bookings") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Забронировать встречу" }).click();
    const firstResponse = await firstResponsePromise;
    expect(firstResponse.status()).toBe(500);

    await expect(page.getByTestId("booking-success")).toHaveCount(0);

    const retryResponsePromise = page.waitForResponse(
      (r) => r.url().includes("/bookings") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Забронировать встречу" }).click();
    const retryResponse = await retryResponsePromise;

    expect(retryResponse.status()).toBe(200);

    const retryBody = await retryResponse.json();
    expect(firstResponseBody).not.toBeNull();
    expect(retryBody.id).toBe(firstResponseBody!.id);

    await expect(page.getByTestId("booking-success")).toBeVisible();
  });
});

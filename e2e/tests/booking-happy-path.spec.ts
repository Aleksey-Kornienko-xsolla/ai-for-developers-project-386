import { test, expect } from "@playwright/test";
import { pickFirstSlot } from "../fixtures/ui";

test.describe("US-1: Guest books a slot (happy path)", () => {
  test("completes full booking flow via UI", async ({ page }) => {
    await page.goto("/booking/intro-call");

    await expect(page.getByRole("heading", { name: "Intro call" })).toBeVisible();

    await pickFirstSlot(page);

    await page.getByLabel("Ваше имя").fill("Test User");
    await page.getByLabel("Email").fill("test-user@example.com");

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes("/bookings") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Забронировать встречу" }).click();
    const response = await responsePromise;

    expect(response.status()).toBe(201);

    await expect(page.getByTestId("booking-success")).toBeVisible();
    await expect(page.getByText("test-user@example.com")).toBeVisible();
    await expect(page.getByText("Test User")).toBeVisible();
  });
});

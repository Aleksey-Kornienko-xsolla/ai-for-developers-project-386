import { test, expect, type APIRequestContext } from "@playwright/test";
import { createBooking } from "../fixtures/api";
import { pickFirstSlot } from "../fixtures/ui";

test.describe("US-2: Slot conflict (409)", () => {
  test("shows conflict when slot already booked", async ({ page, request }) => {
    await page.goto("/booking/intro-call");

    await pickFirstSlot(page);

    const url = page.url();
    const slotId = new URL(url).searchParams.get("slot");
    expect(slotId).toBeTruthy();

    const { status } = await createBooking(
      request as APIRequestContext,
      "intro-call",
      { slotId: slotId!, guest: { name: "Other", email: "other@example.com" } },
      crypto.randomUUID(),
    );
    expect(status).toBe(201);

    await page.getByLabel("Ваше имя").fill("Test User");
    await page.getByLabel("Email").fill("test-user@example.com");

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes("/bookings") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Забронировать встречу" }).click();
    const response = await responsePromise;

    expect(response.status()).toBe(409);

    await expect(page.getByTestId("booking-success")).toHaveCount(0);
    await expect(page.getByTestId("calendar-day").first()).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { createBooking, firstAvailableSlot } from "../fixtures/api";

test.describe("US-5: Delete event type with bookings (409)", () => {
  test("prevents deletion when bookings exist", async ({ page, request }) => {
    const slot = await firstAvailableSlot(request, "intro-call");
    await createBooking(
      request,
      "intro-call",
      { slotId: slot.id, guest: { name: "Someone", email: "s@example.com" } },
      crypto.randomUUID(),
    );

    await page.goto("/admin/event-types");

    const introRow = page.locator("tr", { hasText: "intro-call" });
    await introRow.getByRole("button", { name: "Удалить" }).click();

    await expect(page.getByText("Удалить тип события?")).toBeVisible();
    await page.getByTestId("confirm-delete").click();

    await expect(
      page.getByText("Нельзя удалить: по этому типу есть бронирования"),
    ).toBeVisible();
  });
});

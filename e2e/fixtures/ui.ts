import type { Page, Locator } from "@playwright/test";

export function firstEnabledDay(page: Page): Locator {
  return page.locator('[data-testid="calendar-day"]:not([disabled])').first();
}

export function firstEnabledSlot(page: Page): Locator {
  return page.locator('[data-testid="slot-button"]:not([disabled])').first();
}

export async function pickFirstSlot(page: Page): Promise<void> {
  await firstEnabledDay(page).click();
  await firstEnabledSlot(page).click();
}

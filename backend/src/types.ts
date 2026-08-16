export interface Guest {
  name: string;
  email: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  workStartHour: number;
  workEndHour: number;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export type SlotStatus = "available" | "booked";

export interface Slot {
  id: string;
  startUtc: string;
  endUtc: string;
  durationMinutes: number;
  status: SlotStatus;
}

export interface Booking {
  id: string;
  slotId: string;
  eventType: EventType;
  startUtc: string;
  endUtc: string;
  guest: Guest;
  createdAt: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
}

/** Тело запроса на создание бронирования. */
export interface BookingRequest {
  slotId: string;
  guest: Guest;
}

export interface CreateEventTypeInput {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface UpdateEventTypeInput {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface UpdateOwnerInput {
  name: string;
  email: string;
  workStartHour: number;
  workEndHour: number;
}
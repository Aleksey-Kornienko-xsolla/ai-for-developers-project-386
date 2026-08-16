import type { EventType, Owner } from "../types.js";

export const SEED_OWNER: Owner = {
  id: "owner",
  name: "Alex Owner",
  email: "owner@example.com",
  workStartHour: 9,
  workEndHour: 18,
};

export const SEED_EVENT_TYPES: EventType[] = [
  {
    id: "intro-call",
    name: "Intro call",
    description: "A short 30-minute introductory call.",
    durationMinutes: 30,
  },
  {
    id: "consultation",
    name: "Consultation",
    description: "A full 60-minute consultation session.",
    durationMinutes: 60,
  },
];
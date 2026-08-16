# Booking backend

In-memory implementation of the booking API defined by the TypeSpec contract
in `../contract/`. State resets on restart (by design, MVP).

## Routes (all under `/api/v1`)

Public (guest, no auth):
- `GET    /event-types` — list event types
- `GET    /event-types/:id` — one event type
- `GET    /event-types/:id/availability?fromUtc&toUtc` — slots for 14 days, 15-min grid
- `POST   /event-types/:id/bookings` — book a slot (header `Idempotency-Key` required)

Admin (no auth, single owner):
- `GET    /admin/owner` / `PUT /admin/owner`
- `GET    /admin/event-types` / `POST /admin/event-types`
- `GET    /admin/event-types/:id` / `PUT /admin/event-types/:id` / `DELETE /admin/event-types/:id`
- `GET    /admin/bookings` — upcoming bookings sorted by `startUtc` asc
- `GET    /health` — liveness

Statuses: `200`/`201`/`204` on success; `400` validation; `404` not found;
`409` slot booked / slug taken / cannot delete event type with bookings.

## Run with Docker

```bash
docker compose up --build
# API at http://localhost:8080
```

## Run locally (dev)

```bash
npm install
npm run dev      # tsx watch, http://localhost:8080
```

## Build

```bash
npm run build    # -> dist/
npm start        # node dist/server.js
```

## Frontend integration

`frontend/vite.config.ts` proxies `/api` to `http://localhost:8080` by default.
To use the real backend instead of mocks, set in `frontend/.env`:

```
VITE_USE_MOCK=false
VITE_API_PROXY_TARGET=http://localhost:8080
```

## Seed data

Owner: `owner@example.com`, work hours 09–18 UTC.
Event types: `intro-call` (30m), `consultation` (60m).

## Behavior notes

- Slots are generated on the fly for the next 14 days, 15-minute grid, within
  the owner's `workStartHour`..`workEndHour` window (UTC). Past slots are skippped.
- A booked slot is tracked in a `Set<slotId>`; `POST /bookings` returns `409`
  if the slot is already booked.
- `Idempotency-Key` is required for `POST /bookings`; the first successful
  response is cached and replayed with status `200` for the same key.
- `DELETE /admin/event-types/:id` returns `409` if any booking references it.
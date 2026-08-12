# AGENTS.md

Repository for a Calendly-style booking app. TypeSpec contract in `contract/` is the source of truth for the API; `frontend/` is the React SPA that consumes it.

## Layout
- `contract/` — TypeSpec API definition (`*.tsp`) and compiled OpenAPI output at `contract/tsp-output/@typespec/openapi3/openapi.yaml`. Rebuild with `npm run compile` inside `contract/`.
- `frontend/` — React + TypeScript + Vite SPA. This is where almost all work happens.
- `.github/workflows/hexlet-check.yml` — read-only. Auto-generated Hexlet CI, do not edit.

## Frontend commands (run from `frontend/`)
- `npm run dev` — Vite dev server on `http://127.0.0.1:5173`, with mock backend enabled by default.
- `npm run gen:api` — regenerate `src/shared/api/schema.d.ts` from the OpenAPI yaml. Run after any `contract/` change.
- `npm run typecheck` — `tsc -b --noEmit` (project references, no emit).
- `npm run lint` — ESLint flat config.
- `npm run build` — `tsc -b && vite build`.
- Required order after code changes: `lint` -> `typecheck` -> `build`.

## Mock backend (no real backend exists yet)
- `vite-plugin-mock-dev-server` intercepts `/api/*` in dev only; it does NOT run in `build`/prod.
- Mock state lives in `globalThis.__MOCK_STATE__` inside `mock/db.ts` so it persists across requests within a dev session. Do not move it to module-level `let`/`const` — the plugin re-imports handler modules and module-level state would reset per request.
- Handlers in `mock/handlers/*.ts` mirror the contract routes. Seed data: `owner` = `owner@example.com`, event types `intro-call` (30m) and `consultation` (60m).
- Toggle mocks via `VITE_USE_MOCK` in `frontend/.env` (`true` by default). When real backend is ready, set `VITE_USE_MOCK=false` and point `VITE_API_PROXY_TARGET` at the backend.

## Codegen caveats
- `src/shared/api/schema.d.ts` is generated — never hand-edit. It is gitignored for Prettier but should be committed.
- `openapi-fetch` client is created in `src/shared/api/client.ts` as `apiClient`; use it through TanStack Query hooks, not direct `fetch`.

## Routing
- React Router with lazy-loaded routes. `/` and `/event-types`, `/booking/:id` are public; `/admin/*` (`owner`, `event-types`, `bookings`) uses `AdminLayout` with sidebar nav. Layouts in `src/widgets/`.

## Conventions
- Path aliases: `@/*` -> `src/*`, `@mock/*` -> `mock/*` (configured in `tsconfig.app.json` and `vite.config.ts`).
- Forms use `react-hook-form` + `zod`; derive zod schemas from the generated types in `schema.d.ts`, do not redeclare models by hand.
- Idempotency for `POST /bookings`: generate `Idempotency-Key` once per booking attempt via `crypto.randomUUID()` and reuse on retries.
- Slots are UTC in the API; convert to the browser timezone for display using `Intl.DateTimeFormat` (see `src/shared/lib/date.ts`).
- UI: Tailwind + native elements, no component library. Calendly public view is the visual reference.
- Do not add comments unless explicitly requested.
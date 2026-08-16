# AGENTS.md

Repository for a Calendly-style booking app. TypeSpec contract in `contract/` is the source of truth for the API; `frontend/` is the React SPA that consumes it.

## Layout
- `contract/` — TypeSpec API definition (`*.tsp`) and compiled OpenAPI output at `contract/tsp-output/@typespec/openapi3/openapi.yaml`. Rebuild with `npm run compile` inside `contract/`.
- `frontend/` — React + TypeScript + Vite SPA. This is where almost all work happens.
- `.github/workflows/hexlet-check.yml` — read-only. Auto-generated Hexlet CI, do not edit.
- `backend/` — Fastify + TS in-memory реализация API из TypeSpec-контракта. Docker-сборка готовая (`Dockerfile`, `docker-compose.yml`). State in-memory, сбрасывается при рестарте (MVP).

## Backend (`backend/`)
Fastify 4 + TypeScript; реализует API из `contract/`. Данные in-memory, сбрасываются при рестарте — норма для MVP.

### Команды (из `backend/`)
- `npm run dev` — `tsx watch src/server.ts`, http://localhost:8080
- `npm run build` — `tsc -p tsconfig.json` → `dist/`
- `npm start` — `node dist/server.js` (prod)
- `npm run typecheck` — `tsc -p tsconfig.json --noEmit`
- `npm run lint` — ESLint
- Требуемый порядок после правок: `lint` → `typecheck` → `build`.

### Запуск в Docker
- `docker compose up --build` (из `backend/`) — собирает `booking-backend:latest`, контейнер `booking-backend` на `:8080`. Healthcheck на `GET /health` (30s, retries=3).
- Env: `PORT` (default 8080), `HOST` (default 0.0.0.0) — см. `backend/src/env.ts`.
- Останов: `docker compose down`.

### Подключение фронтенда к реальному бэкенду
В `frontend/.env`:
```
VITE_USE_MOCK=false
VITE_API_PROXY_TARGET=http://localhost:8080
```
Vite-прокси `/api` → `VITE_API_PROXY_TARGET`. Не дублируйте префикс `/api/v1` — он уже в путях сервера и в `schema.d.ts`.

### Маршруты — см. `backend/README.md`
Кратко: public под `/api/v1/event-types*`, admin под `/api/v1/admin/{owner,event-types,bookings}`, плюс `GET /health`. `POST /bookings` требует заголовок `Idempotency-Key`.

### Назначение
Заменяет mock (см. блок ниже) на реальный сервер. Контракт — источник истины в `contract/`; при правках контракта: `npm run gen:api` во `frontend/` + ручная синхронизация маршрутов бэкенда (кодогенерации серверной части нет).

## Frontend commands (run from `frontend/`)
- `npm run dev` — Vite dev server on `http://127.0.0.1:5173`, with mock backend enabled by default.
- `npm run gen:api` — regenerate `src/shared/api/schema.d.ts` from the OpenAPI yaml. Run after any `contract/` change.
- `npm run typecheck` — `tsc -b --noEmit` (project references, no emit).
- `npm run lint` — ESLint flat config.
- `npm run build` — `tsc -b && vite build`.
- Required order after code changes: `lint` -> `typecheck` -> `build`.

## Mock backend
Сейчас есть реальный бэкенд в `backend/` (см. раздел выше) — mock нужен только когда он не запущен или `VITE_USE_MOCK=true`.
- `vite-plugin-mock-dev-server` intercepts `/api/*` in dev only; it does NOT run in `build`/prod.
- Mock state lives in `globalThis.__MOCK_STATE__` inside `mock/db.ts` so it persists across requests within a dev session. Do not move it to module-level `let`/`const` — the plugin re-imports handler modules and module-level state would reset per request.
- `.env`/`.env.example` use `VITE_API_BASE_URL=` (empty) — paths in `schema.d.ts` already start with `/api/v1`, so the client must NOT prepend another prefix (doubling causes requests to fall through the mock handlers and into the proxy → 500).
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
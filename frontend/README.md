# Booking frontend

React + TypeScript + Vite SPA, которое реализует публичный сценарий бронирования (гость) и админку владельца. Контракт API описан на TypeSpec в `../contract/` и является источником истины; типы фронтенда генерируются из OpenAPI.

## Требования
- Node.js 18+ (тестировалось на 18.20)
- npm 10+

## Установка и запуск
```bash
npm install
npm run dev        # http://127.0.0.1:5173, мок-бекенд включён по умолчанию
```

## Скрипты
- `npm run dev` — Vite dev server на `http://127.0.0.1:5173`. Мок-бекенд (`vite-plugin-mock-dev-server`) перехватывает `/api/*` только в dev.
- `npm run build` — `tsc -b && vite build` (prod, без моков).
- `npm run preview` — локальный preview собранного бандла.
- `npm run gen:api` — регенерация `src/shared/api/schema.d.ts` из `../contract/tsp-output/@typespec/openapi3/openapi.yaml`. Запускать после любого изменения в `contract/`.
- `npm run typecheck` — `tsc -b --noEmit`.
- `npm run lint` — ESLint (flat config).

Рекомендуемый порядок проверок после изменений: `lint` → `typecheck` → `build`.

## Переменные окружения (`.env`)
- `VITE_API_BASE_URL` — базовый URL API. По умолчанию пусто: пути в сгенерированной `schema.d.ts` уже начинаются с `/api/v1`, поэтому baseUrl добавлять не нужно.
- `VITE_USE_MOCK` — `true` включает dev-мок-бекенд; `false` отключает (для работы с реальным бекендом).
- `VITE_API_PROXY_TARGET` — куда Vite проксирует `/api/*`, когда моки выключаны (по умолчанию `http://localhost:8080`).

## Архитектура
- `src/app/` — провайдеры (TanStack Query, React Router) и дерево маршрутов.
- `src/pages/` — страницы (`public/`, `admin/`).
- `src/features/` — фичи: `booking` (виджет доступности, форма гостя, экраны success/conflict), `event-types` (CRUD-диалоги), `owner` (форма профиля).
- `src/entities/` — типизированные хуки TanStack Query по сущностям (`event-type`, `booking`, `owner`). `openapi-fetch` клиент в `src/shared/api/client.ts`, используется строго через эти хуки.
- `src/shared/` — переиспользуемые UI-примитивы (`shared/ui`), утилита дат (`shared/lib/date.ts`), конфиг env.
- `src/widgets/` — лейауты: `PublicLayout`, `AdminLayout`.
- `mock/` — обработчики `vite-plugin-mock-dev-server`. Состояние хранится в `globalThis.__MOCK_STATE__` (в `mock/db.ts`), чтобы сохраняться между запросами в рамках dev-сессии. Сиды: владелец `owner@example.com`, типы событий `intro-call` (30 мин) и `consultation` (60 мин).

## Маршруты
- `/` — домашняя страница.
- `/event-types` — публичный список типов событий.
- `/booking/:id` — публичный визард бронирования (выбор слота → форма гостя → подтверждение). Принимает query-параметры:
  - `?slot=20260813T0900` — предвыбрать слот.
  - `?day=2026-08-13` — проскроллить к конкретному дню.
- `/admin`, `/admin/owner`, `/admin/event-types`, `/admin/bookings` — админка (профиль владельца, CRUD типов событий, предстоящие брони).

## Codegen
`src/shared/api/schema.d.ts` генерируется — не редактировать вручную. Файл gitignored для Prettier, но должен коммититься. После правок в `contract/` обновите OpenAPI (`npm run compile` внутри `contract/`) и запустите `npm run gen:api`.

## Конвенции
- Путь-алиасы: `@/*` → `src/*`, `@mock/*` → `mock/*`.
- Формы: `react-hook-form` + `zod` (типы/схемы берутся из сгенерированных через `schema.d.ts`).
- Идемпотентность `POST /bookings`: `Idempotency-Key` генерируется `crypto.randomUUID()` один раз на попытку брони и переиспользуется при ретраях.
- Слоты приходят в UTC; конвертируются в таймзону браузера через `Intl.DateTimeFormat` (см. `src/shared/lib/date.ts`).
- UI: Tailwind + нативные элементы, без компонентной библиотеки. Визуальный референс — публичный вид Calendly.
- Без комментариев в коде, если не запрошено явно.
# План реализации фронтенда

## Стек и инструменты
- **Сборка**: Vite + React + TypeScript
- **Роутинг**: React Router v6 (`/` публичная часть, `/admin/*` админка, lazy-load)
- **Data-клиент**: TanStack Query v5 + `openapi-fetch` (типизированный клиент из OpenAPI)
- **Codegen**: `openapi-typescript` → `src/shared/api/schema.d.ts` (типы), `openapi-fetch` → типизированный клиент
- **Формы/валидация**: `react-hook-form` + `zod` (типы и схема — из сгенерированной `schema.d.ts`)
- **UI**: Tailwind CSS + нативные элементы, визуальный референс — публичный вид Calendly
- **Состояние**: локальный `useState` + `URLSearchParams` для shareable ссылок брони
- **Идемпотентность**: `crypto.randomUUID()` один раз на attempt брони (хранится в ref/state формы)
- **Слоты**: конвертация UTC → таймзона браузера через `Intl.DateTimeFormat` + группировка по дням
- **Линт**: ESLint (flat config) + Prettier
- **Заглушки бекенда**: `vite-plugin-mock-dev-server` (работает только в dev, на prod-сборку не влияет), in-memory store на стороне mock-обработчиков с сид-данными

## Структура проекта
```
frontend/
├─ src/
│  ├─ app/              # провайдеры, роутер, QueryClient
│  │  ├─ providers/     # QueryProvider, RouterProvider
│  │  └─ routes/        # tree маршрутов (lazy)
│  ├─ pages/
│  │  ├─ public/        # EventTypesListPage, EventTypePage
│  │  └─ admin/         # OwnerProfilePage, EventTypesAdminPage, UpcomingBookingsPage
│  ├─ features/
│  │  ├─ booking/       # виджет выбора слота, форма гостя, success/конфликт-экраны
│  │  ├─ event-types/   # список, форма создания, форма редактирования, удаление
│  │  └─ owner/         # форма профиля владельца
│  ├─ entities/         # типизированные хуки по сущностям (useEventTypes, useBookings…)
│  ├─ shared/
│  │  ├─ api/           # client.ts (openapi-fetch), hooks.ts, schema.d.ts (codegen)
│  │  ├─ lib/           # date (UTC→browser TZ), idempotency, zod-schemas
│  │  ├─ ui/            # переиспользуемые примитивы (Button, Input, Spinner, EmptyState, ErrorBanner)
│  │  └─ config/        # env чтение (VITE_API_BASE_URL, VITE_USE_MOCK)
│  └─ main.tsx
├─ mock/                # обработчики vite-plugin-mock-dev-server
│  ├─ mock-server.ts    # регистрация роутов
│  ├─ db.ts            # in-memory store + сид-данные
│  └─ handlers/         # public.ts, admin-event-types.ts, admin-bookings.ts, owner.ts
├─ vite.config.ts        # proxy + mock-dev-server + codegen-hook
├─ scripts/gen-api.ts    # npm-скрипт: openapi-typescript → schema.d.ts
└─ .env, .env.example
```

## Декомпозиция на задачи (с файлами и критериями приёмки)

### Эпик A — Скелет и инфраструктура
**A1. Инициализация проекта**
- Файлы: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `eslint.config.js`, `.prettierrc`, `.env.example` (`VITE_API_BASE_URL=/api/v1`, `VITE_USE_MOCK=true`)
- Приёмка: рабочий `npm run dev` с пустой `App`; `npm run lint` и `npm run typecheck` проходят

**A2. Tailwind + базовый UI-кит**
- `src/shared/ui/{Button,Input,Textarea,Spinner,EmptyState,ErrorBanner,Badge}.tsx`
- Настройка темы под Calendly-референс (нейтральные цвета, primary-акцент)
- Приёмка: кнопки/инпуты рендерятся на тестовой странице

**A3. Codegen OpenAPI → типы + клиент**
- `scripts/gen-api.ts` (читает `contract/tsp-output/@typespec/openapi3/openapi.yaml`, через `openapi-typescript` генерит `src/shared/api/schema.d.ts`)
- `package.json` script: `"gen:api": "tsx scripts/gen-api.ts"`
- `src/shared/api/client.ts` — `createClient<paths>()` из `openapi-fetch` с baseURL из env
- Приёмка: `npm run gen:api` создаёт `schema.d.ts`, `GET /event-types` тайпается по схеме

**A4. TanStack Query + провайдеры**
- `src/app/providers/QueryProvider.tsx` (QueryClient с дефолтами: staleTime 30s, retry 1)
- `src/app/providers/RouterProvider.tsx` (createBrowserRouter с lazy-imports)
- `src/shared/api/hooks.ts` — обёртки `useQuery`/`useMutation` над типизированным клиентом
- Приёмка: провайдеры обёрнуты в `main.tsx`

**A5. Роутер и Layout-ы**
- `src/app/routes/index.tsx` — дерево маршрутов: `/`, `/booking/:id`, `/admin`, `/admin/owner`, `/admin/event-types`, `/admin/bookings` с `ErrorBoundary`
- `src/widgets/PublicLayout.tsx`, `src/widgets/AdminLayout.tsx` (навигация по разделам админки)
- Приёмка: навигация работает, 404-страница рендерится, `/admin/*` изолировано

**A6. Моки бекенда (vite-plugin-mock-dev-server)**
- `mock/db.ts` — in-memory store: `owner`, `eventTypes[]`, `bookings[]`, `idempotencyIndex: Map<key, bookingId>`, сид-данные
- `mock/handlers/public.ts` — `GET /event-types`, `GET /{id}`, `GET /{id}/availability` (генерация слотов на 14 дней вперёд, сетка 15 мин, один слот предзабронирован для демо 409), `POST /{id}/bookings` (идемпотентность по `Idempotency-Key`+`slotId`)
- `mock/handlers/admin-event-types.ts` — CRUD (409 при дубле slug, 409 при удалении с брони)
- `mock/handlers/admin-bookings.ts`, `mock/handlers/owner.ts`
- `vite.config.ts` — `mockDevServerPlugin({ include: 'mock/**/*.ts' })`, вкл только при `VITE_USE_MOCK=true`
- Приёмка: фронт ходит в мок-обработчики как в реальный API; `409` при повторной брони того же слота; `Idempotency-Key` повторной попытки → та же `Booking`

### Эпик B — Публичная часть (guest booking)
**B1. Page EventTypesListPage**
- `src/pages/public/EventTypesListPage.tsx` — `useEventTypes()` → список карточек (название, описание, длительность), клик → `navigate(/booking/:id)`
- Приёмка: список из сид-данных; пустое состояние если `[]`; loading/error

**B2. Page EventTypePage — каркас визарда**
- `src/pages/public/EventTypePage.tsx` — `useEventType(id)`, layout в стиле Calendly (левая колонка — карточка типа, правая — выбор даты/слота)
- Приёмка: 404 при несуществующем `id` (обработка `ErrorResponse`)

**B3. Виджет availability**
- `src/features/booking/AvailabilityWidget.tsx` — `useAvailability(id, fromUtc, toUtc)`, мини-календарь на 14 дней, группировка слотов по дням, конвертация UTC→browser TZ через `Intl.DateTimeFormat`
- `src/shared/lib/date.ts` — `utcToLocalDay`, `formatSlotTime`
- Приёмка: слоты показываются локальным временем, днями; unavailable-слот (статус `booked`) визуально отличается

**B4. Форма гостя и бронирование**
- `src/features/booking/BookingForm.tsx` — `react-hook-form` + `zod` из `BookingRequest` (`Guest.name` minlength 1, `Guest.email` pattern)
- `src/features/booking/BookingForm.model.ts` — zod-схема, `buildIdempotencyKey()` → `crypto.randomUUID()` (хранится в `useRef`, переиспользуется при ретраях)
- `useCreateBooking(id)` — `mutate`, `onSuccess` → экран подтверждения; `409` → toast «слот занят» + invalidate availability; `404` → toast «тип/слот не найден»
- Приёмка: успешная бронь; повторная отправка той же формы (retry) с тем же `Idempotency-Key` → 200 на ту же `Booking`, не создаёт дубль; занятый слот (409) обновляет список

**B5. Success/конфликт-экраны**
- `src/features/booking/BookingSuccess.tsx` — детали брони (тип, дата, время локально, гость)
- `src/features/booking/BookingConflict.tsx` — перевыбор слота
- Приёмка: после брони — экран с деталями, кнопка «вернуться к списку типов»

### Эпик C — Админка
**C1. AdminLayout + навигация**
- `src/widgets/AdminLayout.tsx` — header + sidebar (Owner profile / Event types / Upcoming bookings), `<Outlet/>`
- Приёмка: активный раздел подсвечен по текущему роуту

**C2. OwnerProfilePage**
- `src/pages/admin/OwnerProfilePage.tsx` — `useOwner()`, форма `UpdateOwnerRequest` (name min1, email pattern) → `useUpdateOwner()`
- Приёмка: после PUT — toast, query invalidated, форма перезаполнена

**C3. EventTypesAdminPage (список)**
- `src/pages/admin/EventTypesAdminPage.tsx` — таблица: id, name, duration, действия (Edit, Delete); кнопка «Create»
- Приёмка: удаление с confirm → 409 (есть брони) → подсказка «нельзя удалить: есть брони»; 204 → удаление из списка

**C4. Форма создания типа события (модалка)**
- `src/features/event-types/CreateEventTypeDialog.tsx` — `react-hook-form`+`zod` по `CreateEventTypeRequest`
- zod: `id` pattern `^[a-z0-9][a-z0-9-]{0,49}$`, `name` min1, `durationMinutes` int 5..480
- `useCreateEventType()` → 200|409 (slug занят → inline ошибка на поле id)
- Приёмка: валидация по контракту; дубль-slug даёт 409 с инлайн-сообщением

**C5. Форма редактирования (модалка)**
- `src/features/event-types/EditEventTypeDialog.tsx` — `UpdateEventTypeRequest` (без `id`), `PUT /admin/event-types/:id`
- Приёмка: сохранить → изменённая строка в таблице

**C6. UpcomingBookingsPage**
- `src/pages/admin/UpcomingBookingsPage.tsx` — `useUpcomingBookings()`, таблица (тип, гость, startUtc локально, длительность), сортировка по `startUtc asc` (бек уже сортирует, фронт только отображает)
- Приёмка: пустое состояние «нет предстоящих бронирований»

### Эпик D — Финализация
**D1. Состояния loading/error/empty + инвалидация кэша**
- Во всех списках — `EmptyState`/`Spinner`/`ErrorBanner`
- Ключи инвалидации: после `createEventType`/`update`/`delete` → invalidate `['event-types']`; после `createBooking` → invalidate `['availability', id]` и `['bookings']`
- Приёмка: действия в админке моментально отражаются на списках без перезагрузки

**D2. URLSearchParams для shareable**
- На `EventTypePage`: `?day=YYYY-MM-DD` чтобы открыть конкретный день; `?slot=20260811T0930` чтобы подсветить выбранный слот (используется при возврате из формы конфликта)
- Приёмка: ссылка с `?slot=...` открывает страницу с предвыбранным слотом

**D3. Prod-сборка и README**
- `vite.config.ts` — `base` из env, prod build без моков
- `README.md` (frontend) — `npm run dev`, `npm run gen:api`, `npm run build`, флаг `VITE_USE_MOCK`
- Приёмка: `npm run build` собирает без моков; запуск по README работает у нового разработчика

## Порядок выполнения
A1 → A2 → A3 → A6 (моки можно поднять раньше, чтобы быстро проверять UI) → A4 → A5 → B1 → B2 → B3 → B4 → B5 → C1 → C2 → C3 → C4 → C5 → C6 → D1 → D2 → D3

## Заметки/риски
- Сиды в `mock/db.ts` должны быть согласованы с сидами бекенда (владелец `owner`, типы `intro-call`, `consultation`) чтобы переключение на реальный бекенд прошло без сюрпризов
- `openapi-typescript` и `openapi-fetch` поддерживают OpenAPI 3.0 — схема `contract/tsp-output/.../openapi.yaml` подходит напрямую
- Конвертация UTC→TZ реализуется нативным `Intl`; `date-fns-tz` не обязателен, но если столкнёмся с краевыми DST-кейсами — заменим на `date-fns-tz`
- Порт бекенда для proxy позже укажешь в `.env` (`VITE_API_BASE_URL`), сейчас работаем с `/api/v1` через моки
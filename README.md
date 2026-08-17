### Hexlet tests and linter status:
[![Actions Status](https://github.com/Aleksey-Kornienko-xsolla/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Aleksey-Kornienko-xsolla/ai-for-developers-project-386/actions)
[![E2E](https://github.com/Aleksey-Kornienko-xsolla/ai-for-developers-project-386/actions/workflows/ci.yml/badge.svg)](https://github.com/Aleksey-Kornienko-xsolla/ai-for-developers-project-386/actions/workflows/ci.yml)
[![Release Please](https://github.com/Aleksey-Kornienko-xsolla/ai-for-developers-project-386/actions/workflows/release-please.yml/badge.svg)](https://github.com/Aleksey-Kornienko-xsolla/ai-for-developers-project-386/actions/workflows/release-please.yml)

# Booking app

Calendly-style booking app monorepo: TypeSpec contract, Fastify backend, React frontend.

- [`contract/`](contract/) — TypeSpec API definition (source of truth) + compiled OpenAPI.
- [`backend/`](backend/) — Fastify + TypeScript in-memory implementation.
- [`frontend/`](frontend/) — React + Vite SPA.
- [`e2e/`](e2e/) — Playwright end-to-end tests.
- [`docs/user-scenarios.md`](docs/user-scenarios.md) — зафиксированные пользовательские сценарии.

## Тесты

Интеграционные E2E-тесты (Playwright, chromium) покрывают основной сценарий
бронирования и граничные случаи — см. [`docs/user-scenarios.md`](docs/user-scenarios.md).

Перед запуском тестов нужно собрать backend и frontend (тесты гоняются против
prod-сборок: `node backend/dist/server.js` + `vite preview`):

```bash
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
cd ../e2e && npm install
npx playwright install --with-deps chromium
npx playwright test
```

В `playwright.config.ts` настроено автоматическое поднятие окружения: backend на
`:8080` и frontend preview на `:4173` (`VITE_USE_MOCK=false`). В CI сборка
выполняется отдельными шагами в `.github/workflows/ci.yml` перед запуском тестов.

## CI

- `.github/workflows/ci.yml` — E2E на каждый push/PR в `main`.
- `.github/workflows/commitlint.yml` — проверка формата коммитов (Conventional Commits), блокирует PR.
- `.github/workflows/hexlet-check.yml` — auto-generated Hexlet CI (read-only).

## Релизы

Релизы и changelog формируются автоматически через [release-please](https://github.com/googleapis/release-please)
(один manifest на корень, единый `CHANGELOG.md`, git-тег `vX.Y.Z`).

После merge conventional-коммита в `main` release-please открывает или обновляет
release-PR с changelog и предложенной версией. Merge release-PR создаёт git-тег
и GitHub Release.

## Коммиты

Все коммиты следуют [Conventional Commits](https://www.conventionalcommits.org/):
`type(scope): subject`. См. [`AGENTS.md`](AGENTS.md). Локально — `npm run commit`.

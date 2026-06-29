# Profy Frontend

Веб-интерфейс платформы управления коворкинг-пространством **Profy** (NewLevelHub). SPA на Vite + React 18 + TypeScript, взаимодействующий с [Profy Backend](https://profy.newlevelhub.kz).

## Стек

| Инструмент | Версия | Назначение |
|---|---|---|
| React | 18.3.1 | UI-библиотека |
| Vite | 6.3.5 | Сборщик и dev-сервер |
| TypeScript | ~6.0 (strict) | Строгая типизация |
| React Router | 7.13.0 | Клиентская маршрутизация |
| TanStack React Query | 5.96.1 | Серверное состояние |
| Zustand | 5.0.12 | Клиентское состояние (auth) |
| Tailwind CSS | 4.1.12 | Утилитарные стили (через @tailwindcss/vite) |
| Axios | 1.14.0 | HTTP-клиент |
| Lucide React | 0.487.0 | Иконки |

## Требования

- Node.js 18+ (рекомендуется LTS)
- npm 9+

## Установка и запуск

```bash
# 1. Клонировать репозиторий
git clone <url> && cd Profy-Frontend

# 2. Установить зависимости
npm install

# 3. Создать .env
cp .env.example .env
# Отредактировать .env при необходимости

# 4. Запустить в режиме разработки
npm run dev
```

Приложение доступно на http://localhost:5173.
Dev-сервер проксирует `/api/*` на `http://localhost:8000` — бэкенд должен быть запущен.

## Команды

| Команда | Описание |
|---|---|
| `npm run dev` | Vite dev-сервер с HMR |
| `npm run build` | Продакшн-сборка в `dist/` |
| `npm run start` | Предпросмотр сборки на порту 3000 |
| `npm run typecheck` | Проверка типов TypeScript |

## Переменные окружения

| Переменная | Пример | Описание |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | Базовый URL API. Dev — Vite proxy. Prod — `https://profy.newlevelhub.kz/api/v1` |
| `VITE_APP_NAME` | `Profy` | Название приложения |

Доступ к переменным — только через `src/shared/config/env.ts`.

## Роли пользователей

| Роль | Описание |
|---|---|
| `superadmin` | Полный доступ: компании, здания, ресурсы, все пользователи |
| `company_admin` | Управление своей компанией: сотрудники, бронирования, аналитика |
| `employee` | Бронирования, заявки, CRM, файлы |
| `guest` | Ограниченный доступ: бронирования и пропуска |

Роли определены в `src/shared/config/constants.ts` → `USER_ROLES`. Всегда использовать константы.

## Структура проекта

```
src/
  main.tsx
  app/
    App.tsx          # QueryClient + RouterProvider
    router.tsx       # Маршруты (React Router v7)
  pages/             # Страницы по фичам
  shared/
    api/
      client.ts      # Axios, JWT interceptor, refresh
      endpoints.ts   # API-пути: const API = { ... }
    config/
      constants.ts   # USER_ROLES, статусы
      env.ts         # Типизированные VITE_* переменные
    guards/          # RequireAuth, RequireGuest, RequireRole
    hooks/
      useAuth.ts     # useAuth(), useUser()
    lib/
      cn.ts          # clsx + tailwind-merge
      queryClient.ts # Singleton QueryClient
      storage.ts     # tokenStorage + sessionHint
    store/
      auth.ts        # Zustand auth store
    types/
      index.ts       # User, Booking, Company и др.
    ui/
      layouts/       # AppLayout, AuthLayout
      navigation/    # Header, Sidebar, sidebar-config
      PageStub.tsx   # Заглушка для страниц в разработке
  styles/
    index.css        # Входная точка
    tailwind.css     # Tailwind
    fonts.css        # Google Fonts
    theme.css        # CSS custom properties
```

## Ключевые соглашения

- Импорты — только через алиас `@/`
- API-пути — только через `API` из `@/shared/api/endpoints.ts`
- Роли — только из `USER_ROLES` в `@/shared/config/constants.ts`
- Типы — только из `@/shared/types/index.ts`
- CSS-классы — через `cn()` из `@/shared/lib/cn.ts`
- Серверное состояние — TanStack React Query
- Auth — через `useAuth()` хук

## Референс по экранам

**Profy-Mobile** (React Native / Expo) — источник истины по feature-scope на каждую роль.

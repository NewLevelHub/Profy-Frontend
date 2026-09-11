# Profy Frontend

Веб-интерфейс платформы карьерной ориентации **Profy** (NewLevelHub). SPA на Vite + React 18 + TypeScript, взаимодействующий с [Profy Backend](https://profy.newlevelhub.kz).

> **Референс по экранам:** [profi-mobile](../profi-mobile) (React Native / Expo) — источник истины по структуре страниц и фичам.

## Стек

| Инструмент | Версия | Назначение |
|---|---|---|
| React | 18.3.1 | UI-библиотека |
| Vite | 6.3.5 | Сборщик и dev-сервер |
| TypeScript | ~6.0 (strict) | Строгая типизация |
| React Router | 7.13.0 | Клиентская маршрутизация |
| TanStack React Query | 5.96.1 | Серверное состояние |
| Zustand | 5.0.12 | Клиентское состояние (auth, assessment) |
| Tailwind CSS | 4.1.12 | Утилитарные стили (через @tailwindcss/vite) |
| Axios | 1.14.0 | HTTP-клиент |
| Lucide React | 0.487.0 | Иконки |

## Требования

- Node.js 18+ (рекомендуется LTS)
- npm 9+

## Установка и запуск

```bash
# 1. Клонировать репозиторий
git clone https://github.com/NewLevelHub/Profy-Frontend.git && cd Profy-Frontend

# 2. Установить зависимости
npm install

# 3. Создать .env
cp .env.example .env

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
| `VITE_APP_NAME` | `Profile` | Название приложения |

Доступ к переменным — только через `src/shared/config/env.ts`.

## Структура проекта

```
src/
  main.tsx
  app/
    App.tsx          # QueryClient + RouterProvider
    router.tsx       # Маршруты (React Router v7)
  pages/             # Страницы, зеркалящие экраны profi-mobile
    auth/            # Login, Register, VerifyEmail, ForgotPassword, ResetPassword
    onboarding/      # Welcome, ProfileSetup, ArtifactsSetup
    assessment/      # GoalSelection, Assessment, Praise, ResultLoading
    home/            # Home
    results/         # Results, DirectionDetail, UniversityList, ProgramDetail, GapAnalysis
    roadmap/         # Roadmap
    profile/         # Profile
    errors/          # NotFound
  shared/
    api/
      client.ts      # Axios, JWT interceptor, 401 → logout
      endpoints.ts   # API-пути: const API = { auth, profile, assessment, result, roadmap, universities }
    config/
      constants.ts   # ASSESSMENT_GOALS, BLOCK_NAMES, AGE_GROUPS и др.
      env.ts         # Типизированные VITE_* переменные
    guards/          # RequireAuth, RequireGuest
    hooks/
      useAuth.ts     # useAuth(), useUser(), useIsAuthenticated()
    lib/
      cn.ts          # clsx + tailwind-merge
      queryClient.ts # Singleton QueryClient
      storage.ts     # Утилиты localStorage
    store/
      auth.ts        # Zustand + persist (token, user, _hasHydrated)
      assessment.ts  # Zustand + persist (assessmentId, goal, completedBlocks)
      profile.ts     # Zustand in-memory (ProfileResponse)
      result.ts      # Zustand in-memory (AnalysisResultResponse)
    types/
      index.ts       # User, Assessment, Question, DirectionResult, Roadmap и др.
    ui/
      layouts/       # AppLayout (Header + Outlet), AuthLayout (центрированная карточка)
      navigation/    # Header (горизонтальный nav, мобильный dropdown)
      PageStub.tsx   # Заглушка для страниц в разработке
  styles/
    index.css        # Входная точка стилей
    tailwind.css     # Tailwind + @variant dark
    fonts.css        # Nunito (Google Fonts)
    theme.css        # CSS custom properties (фиолетовая палитра по themes.ts из profi-mobile)
```

## Навигация

Веб-аналог мобильных табов:

| Путь | Экран (profi-mobile) |
|---|---|
| `/home` | HomeScreen |
| `/results` | ResultScreen |
| `/roadmap` | RoadmapScreen |
| `/profile` | ProfileScreen |

## Ключевые соглашения

- Импорты — только через алиас `@/`
- API-пути — только через `API` из `@/shared/api/endpoints.ts`
- Типы — только из `@/shared/types/index.ts`
- CSS-классы — через `cn()` из `@/shared/lib/cn.ts`
- Серверное состояние — TanStack React Query
- Auth — через `useAuth()` хук; токен хранится в Zustand persist (`profy-auth`)
- Дизайн-токены — CSS custom properties в `theme.css`, палитра и радиусы соответствуют `profi-mobile/src/constants/themes/themes.ts`

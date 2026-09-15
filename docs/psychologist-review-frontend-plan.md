# Проверка результата психологом перед публикацией ученику — план (фронтенд)

## Status: Proposed — not yet implemented

Ничего из описанного ниже ещё не реализовано в коде — ни типы, ни новые
API-методы, ни страницы. Этот документ фиксирует согласованный дизайн для
будущей реализации и должен дословно совпадать по форме
`ResultPendingReview` с бэкенд-документом
`Profy-Backend/docs/psychologist-review-gate-plan.md`, которому он
парный.

## Context

Сегодня `useResults.ts` (`src/pages/results/hooks/useResults.ts`)
предполагает, что ответ `GET`/`POST /result` — всегда финальная,
студент-видимая форма (`ResultResponse` = `MiResultResponse |
RiasecResultResponse`, см. `docs/result-api-contract.md`). Единственные
"ожидающие" состояния в `ResultsPage.tsx` сегодня — тест не завершён
(`AssessmentInProgressCard`/`AssessmentNotStartedCard`) и фоновый перевод
уже показанного отчёта на другой язык (`isTranslating`). Состояния "отчёт
ждёт проверки человеком" не существует.

Кабинет психолога (`src/pages/psychologist/PsychologistStudentsPage.tsx`,
`PsychologistStudentDetailPage.tsx`) сегодня показывает по каждому
ассесменту только сводку — `goal`/`status`/`has_result`/`has_roadmap` —
и явно комментирует, что "полный отчёт психологу в этом релизе не
отдаётся". Кабинет психолога не имеет i18n-обёртки — все строки
захардкожены на русском (продуктовое решение KZ-210), в отличие от
студенческих страниц (`ru`/`kk` через `src/shared/i18n`).

Продуктовое требование и итоговый дизайн состояний/эндпоинтов — см.
бэкенд-документ, §0. Здесь — только фронтенд-часть.

## 1. Новые типы — `src/shared/types/index.ts`

```ts
export type ReviewStatus = 'pending_review' | 'published';

export interface ResultPendingReview {
  status: 'pending_review';
  assessment_id: string;
}

// расширение существующего PsychologistAssessmentSummary:
export interface PsychologistAssessmentSummary {
  // ...существующие поля...
  review_status?: ReviewStatus | null;
}

export interface PsychologistReviewQueueItem {
  assessment_id: string;
  student_id: string;
  student_name: string | null;
  student_email: string;
  age_group: AgeGroup | null;
  goal: AssessmentGoal;
  generated_at: string;
  reviewed_at: string | null;
}

export interface PsychologistResultDetail {
  assessment_id: string;
  review_status: ReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  published_by: string | null;
  published_at: string | null;
  summary: string;
  careers: unknown[];
  strengths: string[];
  weaknesses: string[];
  development_plan: { reinforce: string[]; compensate: string[] };
  big_five: Record<string, number>;
  thinking_style: Record<string, number>;
  strength_cards: { title: string; description: string }[];
  thinking_style_notes: { title: string; description: string }[];
  final_analysis: string;
  personality_notes: Record<string, string>;
  motivation_highlights: string[];
  created_at: string;
}

export type PsychologistResultPatch = Partial<
  Pick<
    PsychologistResultDetail,
    | 'summary'
    | 'careers'
    | 'strengths'
    | 'weaknesses'
    | 'strength_cards'
    | 'thinking_style_notes'
    | 'final_analysis'
    | 'personality_notes'
    | 'motivation_highlights'
  >
>;
```

## 2. `src/shared/api/result.ts`

`assertResultV2()` сегодня трактует любую форму, не прошедшую проверку
`report_version===2` + `interest_instrument in ('mi','riasec')`, как
`legacy_result_shape` — это должно остаться верным для реально устаревших
строк, но не должно перехватывать легитимный pending-конверт. Добавить
проверку **до** текущей логики:

```ts
function isPendingReview(data: unknown): data is ResultPendingReview {
  return (data as any)?.status === 'pending_review';
}
```

`resultApi.get`/`resultApi.generate` расширяют тип возврата до
`ResultResponse | ResultPendingReview`; `assertResultV2`/вызывающий код
бросает `legacy_result_shape` только когда форма не совпадает ни с
pending-конвертом, ни с v2-схемой.

## 3. Студенческая сторона

### 3.1 `src/pages/results/hooks/useResults.ts`

- Вычислить `isPendingReview` из сырых данных `useQuery` (`data`), **до**
  того как что-либо пишется в `useResultStore` — стор остаётся типизирован
  ровно как `ResultResponse | null`, как сегодня; pending-состояние не
  персистится в Zustand, это только возвращаемое значение хука (react-query
  уже кэширует сам запрос, персистить нечего).
- `useEffect`, который сегодня вызывает `setReport(data, reportLocale)`
  (строка ~75), должен пропускать вызов, если `data` — pending-конверт.
- Добавить `refetchInterval: isPendingReview ? 60_000 : false` в опции
  `useQuery` — чтобы ученик увидел опубликованный результат без ручного
  обновления страницы (в дополнение к email-уведомлению, которое может
  быть проигнорировано/задержано).
- Возвращаемое значение хука дополняется полем `isPendingReview: boolean`.

### 3.2 `src/pages/results/ResultsPage.tsx`

Новая ветка между текущей `isTranslating` и полным рендером отчёта:

```tsx
if (isPendingReview) {
  return (
    <PageContainer>
      <JourneyEmptyState
        mascotState="pause"
        title={t('pendingReview.title')}
        body={t('pendingReview.body')}
      />
    </PageContainer>
  );
}
```

Если копирайту понадобится больше структуры, чем даёт `JourneyEmptyState`
(иллюстрация + развёрнутый абзац) — новый компонент
`src/pages/results/components/PendingReviewCard.tsx`, но по умолчанию
переиспользовать существующий `JourneyEmptyState`, ничего нового не
создавая без необходимости.

### 3.3 i18n

Строки — в `src/shared/i18n/locales/ru/results.json` **и**
`src/shared/i18n/locales/kk/results.json` (обе локали, по существующей в
репозитории конвенции параллельности ru/kk для студенческих текстов):
новый ключ `pendingReview: { title, body }`.

### 3.4 "Сохранение в профиле"

`AnalysisResult` физически никогда не удаляется — публикация уже
гарантирует постоянное сохранение результата у ученика, отдельный UI для
этого не нужен, если у ученика один активный тест за раз (текущая
модель — 1:1 `Profile → Assessment`, множественные ассесменты на
пользователя сегодня не сценарий продукта). Экран "история прошлых
результатов" — явно за скоупом этого milestone; если понадобится, это
отдельная будущая задача (потребует нового backend-эндпоинта истории,
не описанного в бэкенд-документе).

## 4. Сторона психолога

### 4.1 `src/shared/api/psychologist.ts` + `endpoints.ts`

Новые пути (`API.psychologist.*`):

```ts
reviews: '/psychologist/reviews',
resultReview: (studentId: string, assessmentId: string) =>
  `/psychologist/students/${studentId}/results/${assessmentId}`,
publishResult: (studentId: string, assessmentId: string) =>
  `/psychologist/students/${studentId}/results/${assessmentId}/publish`,
```

Новые методы `psychologistApi`:

```ts
listReviews: () =>
  apiClient.get<PsychologistReviewQueueItem[]>(API.psychologist.reviews)
    .then(r => r.data),

getResultForReview: (studentId: string, assessmentId: string) =>
  apiClient.get<PsychologistResultDetail>(API.psychologist.resultReview(studentId, assessmentId))
    .then(r => r.data),

updateResultContent: (studentId: string, assessmentId: string, patch: PsychologistResultPatch) =>
  apiClient.patch<PsychologistResultDetail>(API.psychologist.resultReview(studentId, assessmentId), patch)
    .then(r => r.data),

publishResult: (studentId: string, assessmentId: string) =>
  apiClient.post<PsychologistResultDetail>(API.psychologist.publishResult(studentId, assessmentId), {})
    .then(r => r.data),
```

### 4.2 `src/pages/psychologist/PsychologistReviewQueuePage.tsx` (новая)

Роут `/psychologist/reviews`. Список отчётов на проверке — те же
строительные блоки, что уже использует `PsychologistStudentsPage.tsx`
(`AdminDataTable`/`AdminColumn`), одна строка на `PsychologistReviewQueueItem`,
клик ведёт на страницу проверки (§4.3). Захардкоженные русские строки, без
i18n-namespace — по прецеденту (KZ-210).

### 4.3 `src/pages/psychologist/PsychologistResultReviewPage.tsx` (новая)

Роут вида `/psychologist/students/:studentId/results/:assessmentId/review`.

Структура секций — по образцу `src/pages/results/print/components/PrintDocument.tsx`
и `PrintSection.tsx` (тот же порядок: сводка → интересы/карьеры → сильные
стороны → личность → мышление/мотивация → итог), но каждый текстовый блок —
контролируемое поле ввода, привязанное к соответствующему ключу
`PsychologistResultPatch`. Новые подкомпоненты — под
`src/pages/psychologist/review/components/` (по аналогии с разбиением
`print/components/`), например `ReviewSummarySection.tsx`,
`ReviewStrengthCardsSection.tsx`, `ReviewFinalAnalysisSection.tsx`.

Элементы управления:
- Кнопка "Сохранить" → `psychologistApi.updateResultContent` (PATCH),
  недоступна, если `review_status === 'published'`.
- Кнопка "Опубликовать" с подтверждением (необратимое действие) →
  `psychologistApi.publishResult`, скрыта/недоступна после публикации.
- Бейдж состояния: `review_status`, `reviewed_at`, `published_at`.

### 4.4 `src/pages/psychologist/PsychologistStudentDetailPage.tsx` (правка)

Заменить статичный текст карточки "Диагностики" ("Краткое саммари —
полный отчёт психологу в этом релизе не отдаётся") на статус-зависимую
подпись: бейдж "На проверке" при `review_status === 'pending_review'` со
ссылкой "Проверить отчёт" на §4.3, бейдж "Опубликовано" при
`review_status === 'published'`.

### 4.5 Роуты — `src/app/router.tsx`

Внутри существующего поддерева `RequirePsychologist` (рядом с
`/psychologist/students*`):

```tsx
{ path: '/psychologist/reviews', element: <PsychologistReviewQueuePage /> },
{ path: '/psychologist/students/:studentId/results/:assessmentId/review', element: <PsychologistResultReviewPage /> },
```

Также при реализации найти файл навигации/сайдбара, из которого сегодня
даётся ссылка на `/psychologist/students`, и добавить туда пункт
"Проверка отчётов" — конкретный файл не был локализован на этапе
планирования, это TODO для реализации, не должно быть потеряно.

### 4.6 i18n психолога

Кабинет психолога остаётся полностью на захардкоженном русском без
namespace — новые страницы (§4.2–4.4) следуют этому же прецеденту, без
добавления новых i18n-ключей, в отличие от студенческой части (§3.3).

## 5. Что нужно будет обновить при реализации (не в этой итерации)

- `docs/result-api-contract.md` — добавить секцию про форму
  `ResultPendingReview` в ответах `GET`/`POST /result` (документ сегодня
  описывает только опубликованную v2-форму и явно помечен "реализовано и
  живёт в проде" — редактировать нужно вместе с кодом, не раньше).

## 6. Порядок раскатки (фронтенд-часть)

Полная последовательность — в бэкенд-документе, §7. Со стороны фронтенда:

1. Дождаться backend PR-A (миграция без смены поведения, бэкенд-документ
   §7 п.1) — на этом этапе `GET`/`POST /result` продолжают отдавать
   финальную форму как сегодня.
2. **Задеплоить терпимую к pending-конверту версию** (§2, §3.1, §3.2) —
   безопасный no-op, пока бэкенд ещё не присылает `ResultPendingReview`.
   Именно после этого шага backend может безопасно переключить поведение
   (бэкенд-документ §7 п.3).
3. Кабинет психолога (§4) — можно деплоить вместе с переключением
   поведения бэкенда или сразу следом, чтобы очередь `pending_review`
   сразу же была разбираема, а не копилась без интерфейса.

## Проверка (при реализации)

Вручную пройти сценарий целиком: ученик завершает тест → видит экран
ожидания (§3.2) вместо отчёта → психолог видит ассесмент в очереди
`/psychologist/reviews` (§4.2) → открывает, правит поля и публикует
(§4.3) → ученик видит опубликованный отчёт без ручного обновления
страницы (за счёт `refetchInterval`, §3.1). Проверить также обратный путь
владения: результат другого ученика по-прежнему даёт `403` и сбрасывает
сессию как сегодня (существующая логика `is403` в `useResults.ts` не
должна пересекаться с новой pending-веткой).

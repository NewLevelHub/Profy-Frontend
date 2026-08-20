# Result API v2 — контракт для фронтенда

Статус: **реализовано и живёт в проде**
(`Profy-Backend/app/schemas/result_v2.py`, `app/routers/result.py`).
Источник истины — Pydantic-схема `MiResultResponse` | `RiasecResultResponse`
(`app/schemas/result_v2.py`) и сгенерированная из неё OpenAPI-схема
(`GET /openapi.json`, компоненты `MiResultResponse`/`RiasecResultResponse`).
Этот документ обязан совпадать с ней 1:1 — при расхождении верна схема, а
документ нужно поправить (не наоборот). Regression-проверка сверки —
`tests/unit/test_result_v2_openapi.py` (в Profy-Backend).

Этот документ самодостаточен: реализовать junior/middle/senior экраны
результата можно, ничего не читая в бэкенд-коде, кроме этого файла.

**В этом репозитории (Profy-Frontend) контракт уже реализован** —
`src/shared/types/index.ts` (`ResultResponse` = `MiResultResponse |
RiasecResultResponse`), `src/pages/results/*`. Сверено напрямую с живым
`GET /openapi.json` — расхождений нет. Этот файл — справочник для будущих
изменений в results-фиче, а не задание на реализацию с нуля.

Старый `AnalysisResultResponse`/`schemas/result.py` (raw/admin-like форма)
**удалён из кодовой базы бэкенда целиком** для student-эндпоинта — `/result`
отдаёт только форму ниже, без исключений и без флага перехода. (Тип
`AnalysisResultResponse` в `shared/types/index.ts` этого репозитория всё ещё
существует, но теперь описывает только admin-контракт — см. §9.4.)

## 1. Эндпоинты

```text
POST /api/v1/result/generate
Content-Type: application/json

{"assessment_id": "uuid"}

GET /api/v1/result/{assessment_id}
```

Оба эндпоинта возвращают одну и ту же student-safe v2-форму. Полный raw
result (проценты, баллы, `match_score`, коды) доступен только через admin
API — см. §9.

## 2. Возрастные ветки assessment

- **junior (6–9)**: MI + Big Five + Harter motivation pairs.
  RIASEC и career matching не используются вообще.
- **middle (10–13)**: RIASEC + Big Five + Harter motivation pairs.
- **senior (14–18)**: RIASEC + Big Five + MOST/LEAST motivation triplets.

Age group сам по себе **не часть ответа** и не должен использоваться
фронтом для ветвления — см. §3 про `interest_instrument`.

## 3. `interest_instrument` — обязательный discriminator

```
"interest_instrument": "mi" | "riasec"
```

Это **единственный** сигнал, по которому фронт определяет форму ответа.
Правило без исключений: **не угадывать инструмент по возрасту профиля,
длине `interest_map`/`careers`, виду `code` или любому другому полю.**
Причины: возраст ответа не приходит в `/result` вообще; длина массивов —
случайное совпадение, а не контракт; buggy backend, вернувший 7 элементов
вместо 8, должен читаться фронтом как ошибка, а не как «наверное это другой
инструмент». `interest_instrument` — единственное поле, гарантированно
задающее форму остального документа (discriminated union на бэкенде:
`MiResultResponse` при `"mi"`, `RiasecResultResponse` при `"riasec"`, третьего
варианта не существует).

`useResults.ts` в этом репозитории уже следует этому правилу: `isJunior =
report.interest_instrument === 'mi'`, не `profile.age_group`.

## 4. Общая форма ответа (оба инструмента)

```jsonc
{
  "report_version": 2,
  "assessment_id": "uuid",
  "interest_instrument": "mi", // discriminator — см. §3
  "summary": "Возрастно-адаптированное резюме без буквенных кодов и баллов.",
  "disclaimer": "Это не окончательный выбор, а карта возможных направлений — со временем картина может измениться, и это нормально.",
  "strength_cards": [
    {
      "title": "Любишь находить закономерности",
      "description": "Короткое наблюдение, подтверждённое ответами."
    }
  ],
  "interest_map": [ /* см. §5 — длина и семантика зависят от instrument */ ],
  "thinking_style_notes": [
    {
      "title": "Системный подход",
      "description": "Как этот стиль проявляется в учёбе и проектах."
    }
  ],
  "motivation_highlights": [
    "Тебе важно разбираться в интересных задачах."
  ],
  "careers": [ /* см. §6 — [] для mi, до 5 для riasec */ ],
  "exploration_activities": [ /* см. §7 — непусто для mi, [] для riasec */ ],
  "is_flat_profile": false,
  "created_at": "2026-08-07T08:00:00Z"
}
```

Поля, общие для обеих веток (`_ResultResponseBase` на бэкенде):
`report_version`, `assessment_id`, `summary`, `disclaimer`, `strength_cards`,
`thinking_style_notes`, `motivation_highlights`, `is_flat_profile`,
`created_at`. `interest_map`/`careers`/`exploration_activities` есть в обеих
ветках, но с разной cardinality/содержимым — см. §5–§7.

**Схема закрыта**: сервер отклонит (и никогда не пришлёт) любое поле, не
перечисленное в этом документе — `extra="forbid"` на всех моделях. Если в
ответе появилось незнакомое поле, это баг совместимости версий, не часть
контракта, которую можно молча пропускать.

### 4.1 `report_version`

Всегда `2` в этой версии контракта. Не используется для ветвления
mi/riasec (для этого — `interest_instrument`, §3) — только чтобы отличить
эту форму ответа от гипотетической будущей `v3`. Фронт может использовать
его как guard (`if (data.report_version !== 2) throw`) на случай, если
бэкенд когда-нибудь добавит breaking `v3`.

### 4.2 `summary` + `disclaimer`

Оба — непустые строки, всегда присутствуют. `summary` — персонализированный
текст (LLM или deterministic fallback, возрастно-адаптированный по длине и
лексике), не гарантированно одинаковый между двумя генерациями по одним и
тем же данным. `disclaimer` — фиксированный, **server-authored** (не LLM)
текст рамки возможностей, побайтово одинаковый в каждом ответе от любого
инструмента/возраста. `summary` может нести ту же мысль своими словами —
`disclaimer` не заменяет её, а гарантирует, что фраза-рамка присутствует
всегда, даже если генерация текста собьётся. Рендерить нужно оба, не
дедуплицируя по смыслу. (`SummaryCard.tsx` уже рендерит оба.)

### 4.3 `strength_cards` / `thinking_style_notes` — evidence-derived, переменная длина

Оба — списки `{title, description}` (обе строки непустые). Это **не**
фиксированный набор: количество карточек — сколько реальных наблюдений
нашлось у конкретного ученика (typically 5–7 для `strength_cards`, 0–2 для
`thinking_style_notes`), а не константа. Фронт не должен полагаться на
конкретную длину этих списков и обязан корректно рендерить как 0, так и N
карточек (пустой `thinking_style_notes` — легитимный, не ошибка). Не путать
с `interest_map` (§5), которая всегда полного, фиксированного размера.

### 4.4 `motivation_highlights` — единая форма независимо от источника

`list[string]`, каждая строка — уже готовая к показу фраза
(«Тебе важно...»). **Одна и та же форма для всех трёх возрастов**, несмотря
на то что данные собираются по-разному:

- junior/middle отвечают на Harter-парные вопросы («что тебе ближе: A или
  B»);
- senior отвечает на тройки MOST/LEAST.

Backend сводит оба потока к одинаковому списку готовых фраз до того, как
что-либо попадает в ответ — фронту не нужно (и не следует пытаться) знать,
из какого исходного формата фраза получена. Может быть пустым списком,
если данных о мотивации недостаточно (крайне маловероятно при валидном
assessment, но не запрещено схемой).

## 5. `interest_map` — cardinality и семантика уровня

`interest_map[]` — **всегда полный набор категорий инструмента**, не
подмножество «сильных сторон»:

| `interest_instrument` | Длина `interest_map` | `code` — допустимые значения |
|---|---|---|
| `mi` (junior) | ровно **8**, всегда, без исключений | `verbal`, `logical`, `musical`, `visual`, `bodily`, `interpersonal`, `intrapersonal`, `naturalistic` |
| `riasec` (middle/senior) | ровно **6**, всегда, без исключений | `R`, `I`, `A`, `S`, `E`, `C` |

Порядок элементов — стабильный backend-порядок (не алфавитный, не по
уровню) — фронт не должен пересортировывать по `level`, чтобы не сломать
ожидаемую раскладку карты интересов.

```jsonc
{ "code": "logical", "sphere": "Логика и закономерности", "level": "high" }
```

- `code` — стабильный технический ключ (см. таблицу выше) — используется
  для выбора иконки (`RIASEC_ICONS`/`MI_ICONS` в `shared/config/constants.ts`),
  не для показа текстом.
- `sphere` — человекочитаемое название на текущем языке ответа, для показа.
- `level`: `"low" | "medium" | "high"` — **только render-state**, никогда
  число и никогда не выводится из числа на фронте. Backend вычисляет его
  из нормализованного 0–100 балла по внутренним порогам — эти пороги **не
  часть контракта** и могут измениться без объявления breaking change;
  фронт обязан относиться к `level` как к непрозрачному enum, а не
  пытаться воспроизвести пороги локально или показывать сам балл.
  (`InterestMapSection.tsx` рисует его 3-точечным индикатором, не баром.)

**Важное отличие от `strength_cards`**: `interest_map` — это *score-derived*
(из сырых нормализованных баллов, по всем категориям без исключения, в том
числе с `level="low"`), а `strength_cards`/interests-подобные поля
narrative-пайплайна — *evidence-derived* (только те категории, что реально
подтверждены как заметный сигнал; переменная длина, см. §4.3). Карта
интересов всегда показывает все 6/8 сфер (даже слабо выраженные — без
негативной окраски, просто короче/бледнее), сильные стороны — только
подтверждённое.

## 6. `careers` — только RIASEC

```
"mi"     → careers: []                           (всегда, без исключений)
"riasec" → careers: до 5 элементов; flat profile → ровно 3
```

Для `mi` backend физически не может прислать непустой `careers` (схема
`MiResultResponse.careers` ограничена `maxItems: 0`) — junior не
career-oriented (methodology), профессии ему не подбираются вообще.

Элемент `careers[]` (только `riasec`):

```jsonc
{
  "slug": "software-developer",
  "name": "Разработчик программного обеспечения",
  "rank": 1,
  "tier": "strong", // strong | good | worth_trying
  "why": "Непустое объяснение на основе разрешённых сигналов.",
  "matched_strengths": ["Любишь разбираться в сложных задачах"],
  "try_now": "Собери маленький проект и отметь, какая часть понравилась.",
  "description": null,
  "skills_needed": [],
  "subjects_to_develop": []
}
```

Гарантированно непустые: `slug`, `name`, `why`, `try_now` (backend всегда
подставляет нейтральный fallback-текст, если у направления в базе нет
данных для персонализации/практического шага — эти поля никогда `null` и
никогда `""`). Легитимно пустые/`null` (можно не рендерить как отдельный
блок, если пусто): `matched_strengths` (пусто, когда конкретный сигнал не
нашёлся — тогда `why` использует нейтральную формулировку, не привязанную
к сигналу), `description` (может быть `null`), `skills_needed`,
`subjects_to_develop` (могут быть `[]`, если у направления в базе нет этих
данных).

`first_steps` — **удалено из student-контракта (2026-08-13)**: раньше
показывался отдельным блоком «Первые шаги» с 3 пунктами поверх `try_now` —
продуктовое решение: этот блок не нёс дополнительной пользы поверх
`try_now` и был убран целиком (backend больше не отдаёт это поле в
`StudentCareer`, фронт-блок удалён). Направление всё ещё может иметь
несколько «первых шагов» в БД (`Direction.first_steps`), но студенту
показывается только первый — как `try_now`.

`rank` — 1-based позиция в списке (порядок уже финальный, фронт не
пересортировывает). `tier` — три уровня совпадения вместо чисел (TZ §18.3:
проценты ребёнку не показываются); `rank`+`tier` вместе задают порядок и
визуальный вес, самого `match_score` в ответе нет и не будет.
(`CAREER_TIER_LABELS` в `shared/config/constants.ts` — готовые подписи.)

## 7. `exploration_activities`

```
"mi"     → непустой список коротких безопасных занятий (MI content layer)
"riasec" → всегда []
```

Для `riasec` это поле **не отсутствует, а всегда присутствует как пустой
массив** — не как признак ошибки и не «что-то не подгрузилось», просто у
этой ветки нет контента для этого поля (только `careers` несёт эту роль
для middle/senior). Фронт должен проверять `interest_instrument`, а не
непустоту `exploration_activities`, чтобы решить, какой блок рендерить.

## 8. Flat profile

- `is_flat_profile: boolean` — вычисляется backend'ом (внутренний порог
  разброса между категориями), фронт **не** вычисляет и не имеет доступа к
  порогу или к сырым баллам, из которых он вычислен.
- `riasec` + `is_flat_profile=true` → `careers` содержит **ровно 3**
  элемента, у всех `tier="worth_trying"` (схема отклонит любую другую
  комбинацию на бэкенде — это структурная гарантия, не просто соглашение).
- `mi` + `is_flat_profile=true` → `careers` как обычно `[]`; `summary` и
  `exploration_activities` формулируют это как приглашение попробовать
  разное, никогда как «слабый результат» (Приложение C ТЗ).

## 9. Ошибки, rollout, student vs admin

### 9.1 Ошибки

`POST /result/generate` разрешён только после завершения всех обязательных
треков конкретного возраста (см. §2). Неполный assessment не переводится в
`completed`, и `AnalysisResult` не создаётся.

| Код | Когда |
|---|---|
| `403` | `assessment_id` принадлежит другому пользователю |
| `404` | `assessment_id` не существует (`POST`), либо отчёт ещё не сгенерирован (`GET`) |
| `409` | обязательные ответы для этого возраста ещё не завершены |

Ошибка LLM или недоступность Redis **никогда** не превращаются в `5xx`:
backend всегда возвращает валидный `200` той же v2-формы — либо
LLM-персонализированный текст, либо детерминированный fallback-шаблон
(фронт не может отличить один от другого по форме ответа, и не должен
пытаться).

### 9.2 Идемпотентность / повторные запросы

`POST /result/generate` генерирует отчёт **один раз**. Повторный `POST` на
уже сгенерированный `assessment_id`, конкурентные параллельные `POST` и
последующий `GET` — все возвращают один и тот же сохранённый результат, ни
один из них не запускает скрытую повторную LLM-генерацию. Ответ на один и
тот же `assessment_id` не меняется между вызовами (кроме как через
отдельный админский триггер регенерации — вне этого контракта).

### 9.3 Rollout-примечание

Строки `AnalysisResult`, созданные до появления v2-пайплайна
(`report_version=1`, `strength_cards`/`thinking_style_notes` пустые не
потому, что у ученика нет сигналов, а потому что их никто не заполнял),
могут не проходить валидацию текущей v2-схемы при чтении (например,
`exploration_activities` для junior требует непустого списка, у legacy-строк
он `[]`). Для продакшена это означает: любой assessment, для которого отчёт
был сгенерирован до перехода на v2, должен быть регенерирован (админский
триггер) прежде чем `/result` сможет отдать его корректно. Новых `POST
/result/generate` это не касается — они всегда создают `report_version=2`
строки.

### 9.4 Student vs admin

Этот документ описывает **только** `/api/v1/result/*` (student-facing).
Admin-панель использует отдельный, не пересекающийся раздел API с полной
raw-формой (проценты, `match_score`, буквенные коды, сырые баллы Big Five,
`meta`, `development_plan` и т.д.) — эти два контракта поддерживаются как
независимые Pydantic-схемы на бэкенде и никогда не имеют общих полей вне
чисто технических (`assessment_id`, `created_at`). Ни одно из полей §6
списка «что не возвращает student API» не должно просачиваться в этот
документ ни при каком будущем изменении.

В этом репозитории admin-форма всё ещё живёт под именем
`AnalysisResultResponse` (`shared/types/index.ts`) — историческое название,
раньше так называлась именно student-схема, теперь это чисто
`AdminAssessmentDetail.analysis_result`.

## 10. Что student API не возвращает

Нельзя отдавать (и текущая реализация не отдаёт, `extra="forbid"`, §4):
`profile` (сырые нормализованные баллы по категориям), raw top-code list,
`meta` (differentiation/consistency/aversion), `match_score`, raw
`strengths`/`weaknesses` (буквенные/ключевые коды), `development_plan`,
`big_five`, `personality_profile`, `personality_notes`, raw `thinking_style`
(числа), `motivation` (сырые баллы), `motivation_top` (сырые категории).

Не показывать проценты, баллы, диагнозы, сравнительные ярлыки или выводы о
способностях/будущей успешности — ни в одном поле, включая
LLM-персонализированные `summary`/`strength_cards`/`thinking_style_notes`
(это гарантирует не форма схемы, а отдельный content-валидатор на
бэкенде — вне контракта формы, но релевантно для UI-ревью текста).

## 11. Где это уже реализовано в этом репозитории

| Контракт | Frontend-файл |
|---|---|
| Типы (§4–§8) | `src/shared/types/index.ts` — `ResultResponse` |
| Запросы (§1) | `src/shared/api/result.ts` |
| `interest_instrument`-ветвление (§3) | `src/pages/results/hooks/useResults.ts` |
| `summary`/`disclaimer` (§4.2) | `src/pages/results/components/SummaryCard.tsx` |
| `strength_cards` (§4.3) | `src/pages/results/components/StrengthCardsSection.tsx` |
| `interest_map` (§5) | `src/pages/results/components/InterestMapSection.tsx` |
| `careers` (§6) | `src/pages/results/components/CareerCard.tsx`, `DirectionDetailPage.tsx` |
| `exploration_activities` (§7) | `src/pages/results/components/ExplorationActivitiesSection.tsx` |
| `thinking_style_notes` | `src/pages/results/components/ThinkingStyleSection.tsx` |
| `motivation_highlights` | `src/pages/results/components/MotivationSection.tsx` |

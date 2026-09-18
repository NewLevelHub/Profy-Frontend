import type { TFunction } from 'i18next';

/**
 * Comprehensive Knowledge Base & Interpretations for New Tests in Psychologist Report.
 *
 * Source: /profor/Тикеты-новые-тесты/06-Обзор-тестов-для-психолога.md
 * Mirrors the RIASEC benchmark pattern (means, follows, why/evidence, counseling focuses).
 * Localized through 'psychReport' namespace.
 */

export interface TestMethodologyInfo {
  title: string;
  subtitle: string;
  source: string;
  description: string;
  whatItMeasures: string;
  notes?: string;
}

export interface ScaleDetailInfo {
  key: string;
  name: string;
  shortName?: string;
  meaning: string;
  behavioralManifestation: string; // "В чём проявляется" (means)
  psychologistFocus: string; // "Что из этого следует для консультации" (follows)
  riskWarning?: string; // Зона риска / внимание
  normsExplanation?: string; // "Почему так получилось" (пороги, расчёт)
}

/* ==========================================================================
   1. EYSENCK EPI (Темперамент)
   ========================================================================== */

export function getEysenckMethodology(t: TFunction): TestMethodologyInfo {
  return t('psychReport:eysenck.methodology', { returnObjects: true }) as unknown as TestMethodologyInfo;
}

export function getTemperamentQuadrants(t: TFunction): Record<string, ScaleDetailInfo> {
  const raw = t('psychReport:eysenck.quadrants', { returnObjects: true }) as Record<
    string,
    Omit<ScaleDetailInfo, 'key'>
  >;
  const result: Record<string, ScaleDetailInfo> = {};
  for (const [k, v] of Object.entries(raw || {})) {
    result[k] = { ...v, key: k, shortName: v.name };
  }
  return result;
}

export function getEysenckScales(t: TFunction): Record<
  string,
  {
    name: string;
    description: string;
    bands: Record<string, { label: string; meaning: string; advice: string }>;
  }
> {
  return t('psychReport:eysenck.scales', { returnObjects: true }) as unknown as Record<
    string,
    {
      name: string;
      description: string;
      bands: Record<string, { label: string; meaning: string; advice: string }>;
    }
  >;
}

/* ==========================================================================
   2. ДДО (Профессиональные типы Климова)
   ========================================================================== */

export function getDdoMethodology(t: TFunction): TestMethodologyInfo {
  return t('psychReport:ddo.methodology', { returnObjects: true }) as unknown as TestMethodologyInfo;
}

export function getDdoTypes(t: TFunction): Record<string, ScaleDetailInfo> {
  const raw = t('psychReport:ddo.types', { returnObjects: true }) as Record<
    string,
    Omit<ScaleDetailInfo, 'key'>
  >;
  const result: Record<string, ScaleDetailInfo> = {};
  for (const [k, v] of Object.entries(raw || {})) {
    result[k] = { ...v, key: k };
  }
  return result;
}

export function getDdoDissonanceNote(t: TFunction): {
  title: string;
  interestHigher: string;
  abilitiesHigher: string;
  balanced: string;
} {
  return t('psychReport:ddo.dissonance', { returnObjects: true }) as unknown as {
    title: string;
    interestHigher: string;
    abilitiesHigher: string;
    balanced: string;
  };
}

/* ==========================================================================
   3. ELERS (Мотивация к успеху / Уровень притязаний)
   ========================================================================== */

export function getElersMethodology(t: TFunction): TestMethodologyInfo {
  return t('psychReport:elers.methodology', { returnObjects: true }) as unknown as TestMethodologyInfo;
}

export function getElersLevels(t: TFunction): Record<string, ScaleDetailInfo> {
  const raw = t('psychReport:elers.levels', { returnObjects: true }) as Record<
    string,
    Omit<ScaleDetailInfo, 'key'>
  >;
  const result: Record<string, ScaleDetailInfo> = {};
  for (const [k, v] of Object.entries(raw || {})) {
    result[k] = { ...v, key: k };
  }
  return result;
}

/* ==========================================================================
   4. БОЙКО + КОНДАШ (Эмпатия и социальная уверенность)
   ========================================================================== */

export function getBoykoKondashMethodology(t: TFunction): TestMethodologyInfo {
  return t('psychReport:boykoKondash.methodology', { returnObjects: true }) as unknown as TestMethodologyInfo;
}

export function getBoykoChannels(t: TFunction): Record<string, ScaleDetailInfo> {
  const raw = t('psychReport:boykoKondash.channels', { returnObjects: true }) as Record<
    string,
    Omit<ScaleDetailInfo, 'key'>
  >;
  const result: Record<string, ScaleDetailInfo> = {};
  for (const [k, v] of Object.entries(raw || {})) {
    result[k] = { ...v, key: k };
  }
  return result;
}

export function getBoykoTotalLevels(
  t: TFunction,
): Record<string, { label: string; meaning: string; advice: string }> {
  return t('psychReport:boykoKondash.totalLevels', { returnObjects: true }) as unknown as Record<
    string,
    { label: string; meaning: string; advice: string }
  >;
}

export function getKondashLevels(
  t: TFunction,
): Record<string, { label: string; meaning: string; advice: string }> {
  return t('psychReport:boykoKondash.confidenceLevels', { returnObjects: true }) as unknown as Record<
    string,
    { label: string; meaning: string; advice: string }
  >;
}

/* ==========================================================================
   5. BELBIN BTRSPI (Командные роли)
   ========================================================================== */

export function getBelbinMethodology(t: TFunction): TestMethodologyInfo {
  return t('psychReport:belbin.methodology', { returnObjects: true }) as unknown as TestMethodologyInfo;
}

export function getBelbinRoles(t: TFunction): Record<string, ScaleDetailInfo> {
  const raw = t('psychReport:belbin.roles', { returnObjects: true }) as Record<
    string,
    Omit<ScaleDetailInfo, 'key'>
  >;
  const result: Record<string, ScaleDetailInfo> = {};
  for (const [k, v] of Object.entries(raw || {})) {
    result[k] = { ...v, key: k, shortName: v.name };
  }
  return result;
}

/* ==========================================================================
   6. АСТУР (Интеллект и умственное развитие)
   ========================================================================== */

export function getAsturMethodology(t: TFunction): TestMethodologyInfo {
  return t('psychReport:astur.methodology', { returnObjects: true }) as unknown as TestMethodologyInfo;
}

export function getAsturSubtests(t: TFunction): Record<string, ScaleDetailInfo> {
  const raw = t('psychReport:astur.subtests', { returnObjects: true }) as Record<
    string,
    Omit<ScaleDetailInfo, 'key'>
  >;
  const result: Record<string, ScaleDetailInfo> = {};
  for (const [k, v] of Object.entries(raw || {})) {
    result[k] = { ...v, key: k };
  }
  return result;
}

export function getAsturSpnGroups(
  t: TFunction,
): Record<number, { label: string; meaning: string; advice: string }> {
  return t('psychReport:astur.spnGroups', { returnObjects: true }) as unknown as Record<
    number,
    { label: string; meaning: string; advice: string }
  >;
}

export function getAsturLabilityNote(t: TFunction): {
  title: string;
  fatigueDetected: string;
  stable: string;
} {
  return t('psychReport:astur.lability', { returnObjects: true }) as unknown as {
    title: string;
    fatigueDetected: string;
    stable: string;
  };
}

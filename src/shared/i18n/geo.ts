import i18next from 'i18next';

import { DEFAULT_LOCALE } from '@/shared/store/locale';

/**
 * KZ-502 — university/program catalog rows carry city/country as a single
 * Russian string (backend data, not `*_i18n`-translated). For the `kk` UI we
 * localize a small closed set of Kazakhstan cities and the countries that
 * actually appear in the dataset via this dictionary; anything not listed is
 * shown exactly as it came, never blanked or errored.
 *
 * Kazakh spellings are LLM-seeded and pending native review
 * (`ProfOr/Тикеты-локализация-KZ/KZ-502-вычитка-kk.md`).
 */
const CITY_KK: Record<string, string> = {
  'Алматы': 'Алматы',
  'Астана': 'Астана',
  'Нур-Султан': 'Астана',
  'Нурсултан': 'Астана',
  'Шымкент': 'Шымкент',
  'Караганда': 'Қарағанды',
  'Актобе': 'Ақтөбе',
  'Тараз': 'Тараз',
  'Павлодар': 'Павлодар',
  'Усть-Каменогорск': 'Өскемен',
  'Семей': 'Семей',
  'Атырау': 'Атырау',
  'Костанай': 'Қостанай',
  'Кызылорда': 'Қызылорда',
  'Уральск': 'Орал',
  'Петропавловск': 'Петропавл',
  'Актау': 'Ақтау',
  'Темиртау': 'Теміртау',
  'Туркестан': 'Түркістан',
  'Кокшетау': 'Көкшетау',
  'Талдыкорган': 'Талдықорған',
  // backend catalog spells this "Екибастуз" (Е, not Э); keep both to be safe
  'Екибастуз': 'Екібастұз',
  'Экибастуз': 'Екібастұз',
  'Рудный': 'Рудный',
  'Аркалык': 'Арқалық',
  // foreign cities frequent in the catalog that differ in kk
  'Пекин': 'Бейжің',
  'Стамбул': 'Стамбұл',
  'Москва': 'Мәскеу',
  'Казань': 'Қазан',
  'Бишкек': 'Бішкек',
};

const COUNTRY_KK: Record<string, string> = {
  'Казахстан': 'Қазақстан',
  'Россия': 'Ресей',
  'США': 'АҚШ',
  'Великобритания': 'Ұлыбритания',
  'Германия': 'Германия',
  'Китай': 'Қытай',
  'Канада': 'Канада',
  'Австралия': 'Аустралия',
  'Франция': 'Франция',
  'Нидерланды': 'Нидерланд',
  'Италия': 'Италия',
  'Испания': 'Испания',
  'Швейцария': 'Швейцария',
  'Швеция': 'Швеция',
  'Япония': 'Жапония',
  'Южная Корея': 'Оңтүстік Корея',
  'Сингапур': 'Сингапур',
  'ОАЭ': 'БАӘ',
  'Турция': 'Түркия',
  'Польша': 'Польша',
  'Чехия': 'Чехия',
  'Финляндия': 'Финляндия',
  'Норвегия': 'Норвегия',
  'Дания': 'Дания',
  'Австрия': 'Аустрия',
  'Бельгия': 'Бельгия',
  'Венгрия': 'Венгрия',
  'Ирландия': 'Ирландия',
  'Новая Зеландия': 'Жаңа Зеландия',
  'Гонконг': 'Гонконг',
  'Малайзия': 'Малайзия',
  'Индия': 'Үндістан',
  'Бразилия': 'Бразилия',
  'Азербайджан': 'Әзірбайжан',
  'Киргизия': 'Қырғызстан',
  'Узбекистан': 'Өзбекстан',
  'Таджикистан': 'Тәжікстан',
  'Туркменистан': 'Түрікменстан',
};

const GEO_KK: Record<string, string> = { ...COUNTRY_KK, ...CITY_KK };

/**
 * Localized display form of a backend geo string (city or country). Returns
 * the Kazakh spelling only when the active UI language is `kk` and the value
 * is in the dictionary; otherwise the input is returned untouched.
 */
export function localizeGeo(name: string | null | undefined): string {
  if (!name) return '';
  const lng = i18next.language || DEFAULT_LOCALE;
  if (lng !== 'kk') return name;
  return GEO_KK[name.trim()] ?? name;
}

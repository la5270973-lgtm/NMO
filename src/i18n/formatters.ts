/**
 * NMO | نمو — Child Growth Application
 * Medical Date, Age & Unit Formatters
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { Language } from './types.ts';
import { AgeCalculationResult } from '../types/growth.ts';

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Formats ISO YYYY-MM-DD date string according to language conventions:
 * Arabic: "28 سبتمبر 2026"
 * English: "28 September 2026"
 */
export function formatDisplayDate(isoDate: string, lang: Language): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length < 3) return isoDate;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(monthIdx) || isNaN(day) || monthIdx < 0 || monthIdx > 11) {
    return isoDate;
  }

  if (lang === 'ar') {
    return `${day} ${ARABIC_MONTHS[monthIdx]} ${year}`;
  } else {
    return `${day} ${ENGLISH_MONTHS[monthIdx]} ${year}`;
  }
}

/**
 * Formats child age with authentic linguistic grammar:
 * Arabic: handles singular, dual (مثنى), and plurals (جمع تكسير/تمييز):
 * e.g. "سنتان و3 أشهر و13 يومًا"
 * English: "2 years, 3 months, 13 days"
 */
export function formatChildAge(age: AgeCalculationResult, lang: Language): string {
  const y = age.completedYears;
  const m = age.completedMonths;
  const d = age.remainingDays;

  if (lang === 'ar') {
    const parts: string[] = [];

    // Years
    if (y === 1) {
      parts.push('سنة واحدة');
    } else if (y === 2) {
      parts.push('سنتان');
    } else if (y >= 3 && y <= 10) {
      parts.push(`${y} سنوات`);
    } else if (y > 10) {
      parts.push(`${y} سنة`);
    }

    // Months
    if (m === 1) {
      parts.push('شهر واحد');
    } else if (m === 2) {
      parts.push('شهران');
    } else if (m >= 3 && m <= 10) {
      parts.push(`${m} أشهر`);
    } else if (m > 10) {
      parts.push(`${m} شهراً`);
    }

    // Days
    if (d === 1) {
      parts.push('يوم واحد');
    } else if (d === 2) {
      parts.push('يومان');
    } else if (d >= 3 && d <= 10) {
      parts.push(`${d} أيام`);
    } else if (d > 10) {
      parts.push(`${d} يوماً`);
    }

    if (parts.length === 0) {
      return age.ageInDays === 0 ? 'حديث الولادة (اليوم الأول)' : `${age.ageInDays} يوماً`;
    }

    return parts.join(' و');
  } else {
    const parts: string[] = [];

    if (y > 0) {
      parts.push(`${y} ${y === 1 ? 'year' : 'years'}`);
    }
    if (m > 0) {
      parts.push(`${m} ${m === 1 ? 'month' : 'months'}`);
    }
    if (d > 0 || parts.length === 0) {
      parts.push(`${d} ${d === 1 ? 'day' : 'days'}`);
    }

    return parts.join(', ');
  }
}

/**
 * Consistent decimal rounding rule for final presentation layer:
 * - Internal calculation: full precision
 * - Parent-facing percentile: 1 decimal place (standard mathematical rounding half-away-from-zero,
 *   mitigating IEEE-754 precision representation e.g. 32.65 -> 32.7)
 * - Parent-facing Z-score: 2 decimal places
 */
export function roundPresentationNumber(val: number, decimals: number): string {
  if (isNaN(val)) return '—';
  const sign = val < 0 ? -1 : 1;
  const abs = Math.abs(val);
  const factor = Math.pow(10, decimals);
  const rounded = sign * (Math.round((abs + Number.EPSILON) * factor) / factor);
  return rounded.toFixed(decimals);
}

/**
 * Strips any English ordinal suffixes (st, nd, rd, th) or % symbols from a percentile value,
 * returning clean numeric representation rounded to 1 decimal place per defined rounding rule
 * (e.g. 32.65 -> 32.7, 41.32 -> 41.3, 48.82 -> 48.8, 52.32 -> 52.3, 31.52 -> 31.5).
 */
export function cleanPercentile(percentile: number | string | undefined | null): string {
  if (percentile === undefined || percentile === null || percentile === '') return '—';
  if (typeof percentile === 'number') {
    return roundPresentationNumber(percentile, 1);
  }
  const str = String(percentile).trim();
  if (str.startsWith('<') || str.startsWith('>')) {
    const symbol = str[0];
    const cleaned = str.slice(1).replace(/[a-zA-Z%]/g, '').trim();
    const num = parseFloat(cleaned);
    return !isNaN(num) ? `${symbol}${roundPresentationNumber(num, 1)}` : `${symbol}${cleaned}`;
  }
  const cleaned = str.replace(/[a-zA-Z%]/g, '').trim();
  const num = parseFloat(cleaned);
  return !isNaN(num) ? roundPresentationNumber(num, 1) : cleaned;
}

/**
 * Formats percentile strictly per prompt requirements:
 * Arabic: "المئين: 32.7"
 * English: "Percentile: 32.7"
 * Never generates "st", "nd", "rd", or "th" in Arabic UI.
 */
export function formatPercentileDisplay(
  percentile: number | string | undefined | null,
  lang: Language
): string {
  const cleanVal = cleanPercentile(percentile);
  return lang === 'ar' ? `المئين: ${cleanVal}` : `Percentile: ${cleanVal}`;
}

export type UnitSystem = 'metric' | 'imperial';

/**
 * Formats height/length with support for Metric (cm) and Imperial (in):
 * Metric: "88.5 cm"
 * Imperial: "34.8 in"
 */
export function formatHeight(cmVal: number | string | undefined, unitSystem: UnitSystem = 'metric'): string {
  if (cmVal === undefined || cmVal === null || cmVal === '') return '—';
  const num = typeof cmVal === 'string' ? parseFloat(cmVal) : cmVal;
  if (isNaN(num)) return '—';

  if (unitSystem === 'imperial') {
    const inches = Number((num / 2.54).toFixed(1));
    return `${inches} in`;
  }
  return `${num} cm`;
}

/**
 * Formats weight with support for Metric (kg) and Imperial (lb):
 * Metric: "12.5 kg"
 * Imperial: "27.6 lb"
 */
export function formatWeight(kgVal: number | string | undefined, unitSystem: UnitSystem = 'metric'): string {
  if (kgVal === undefined || kgVal === null || kgVal === '') return '—';
  const num = typeof kgVal === 'string' ? parseFloat(kgVal) : kgVal;
  if (isNaN(num)) return '—';

  if (unitSystem === 'imperial') {
    const lbs = Number((num * 2.20462).toFixed(1));
    return `${lbs} lb`;
  }
  return `${num} kg`;
}

/**
 * Formats head circumference:
 * Metric: "48.0 cm"
 * Imperial: "18.9 in"
 */
export function formatHeadCircumference(cmVal: number | string | undefined, unitSystem: UnitSystem = 'metric'): string {
  if (cmVal === undefined || cmVal === null || cmVal === '') return '—';
  const num = typeof cmVal === 'string' ? parseFloat(cmVal) : cmVal;
  if (isNaN(num)) return '—';

  if (unitSystem === 'imperial') {
    const inches = Number((num / 2.54).toFixed(1));
    return `${inches} in`;
  }
  return `${num} cm`;
}

/**
 * Formats BMI (always kg/m² as standard clinical index):
 * "15.96 kg/m²"
 */
export function formatBMI(bmiVal: number | string | undefined): string {
  if (bmiVal === undefined || bmiVal === null || bmiVal === '') return '—';
  return `${bmiVal} kg/m²`;
}

/**
 * Formats scientific numbers with Latin unit characters:
 * "88.5 cm", "12.5 kg", "15.96 kg/m²"
 */
export function formatMedicalValue(val: number | string | undefined, unit: 'cm' | 'kg' | 'kg/m²'): string {
  if (val === undefined || val === null || val === '') return '—';
  return `${val} ${unit}`;
}

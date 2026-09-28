/**
 * NMO | نمو — Child Growth Application
 * Clinical Growth Status Evaluator (Strict Non-Diagnostic Terms)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { Language } from '../i18n/types.ts';
import { IndicatorCalculationResult } from '../types/growth.ts';

export type GrowthStatusCategory =
  | 'reassuring_growth'     // 🟢 نمو مطمئن / Reassuring Growth
  | 'within_expected'       // 🟢 ضمن المتوقع / Within Expected Range
  | 'needs_followup'        // 🟡 يحتاج متابعة / Needs Follow-up
  | 'consider_review'       // 🟠 يُنصح بمراجعة الطبيب / Consider Medical Review
  | 'insufficient_data';    // 🔵 بيانات غير كافية / Insufficient Data

export interface GrowthStatusDisplay {
  category: GrowthStatusCategory;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  iconSymbol: string;
  description: string;
}

export class ClinicalGrowthStatus {
  /**
   * Evaluates child growth status based strictly on WHO Z-score intervals.
   * 
   * STRICT REGULATORY RULE:
   * Never state "طفلك طبيعي" (your child is normal), "طفلك سليم" (your child is healthy),
   * or "لا توجد مشكلة" (no problem) because NMO is a monitoring tool, not a diagnostic system.
   */
  public static evaluate(
    indicator?: IndicatorCalculationResult,
    lang: Language = 'ar'
  ): GrowthStatusDisplay {
    if (!indicator || indicator.status !== 'VALID') {
      return {
        category: 'insufficient_data',
        label: lang === 'ar' ? 'بيانات غير كافية' : 'Insufficient Data',
        badgeBg: 'bg-blue-500/10',
        badgeText: 'text-blue-400',
        badgeBorder: 'border-blue-500/20',
        dotColor: 'bg-blue-400',
        iconSymbol: '🔵',
        description:
          lang === 'ar'
            ? 'يرجى تسجيل قياسات مكتملة لحساب مؤشرات النمو.'
            : 'Please record complete measurements to calculate growth indicators.',
      };
    }

    const z = indicator.zScore;
    const absZ = Math.abs(z);

    if (absZ > 3.0) {
      return {
        category: 'consider_review',
        label: lang === 'ar' ? 'يُنصح بمراجعة الطبيب' : 'Consider Medical Review',
        badgeBg: 'bg-orange-500/10',
        badgeText: 'text-orange-400',
        badgeBorder: 'border-orange-500/25',
        dotColor: 'bg-orange-400',
        iconSymbol: '🟠',
        description:
          lang === 'ar'
            ? 'القياس يقع خارج النطاق المعتاد (أكثر من 3 انحرافات معيارية). يُنصح بمراجعة الطبيب للمتابعة السريرية.'
            : 'The measurement lies beyond the usual range (> 3 SD). Medical review with a pediatrician is recommended for clinical assessment.',
      };
    } else if (absZ > 2.0) {
      return {
        category: 'needs_followup',
        label: lang === 'ar' ? 'يحتاج متابعة' : 'Needs Follow-up',
        badgeBg: 'bg-yellow-500/10',
        badgeText: 'text-yellow-400',
        badgeBorder: 'border-yellow-500/25',
        dotColor: 'bg-yellow-400',
        iconSymbol: '🟡',
        description:
          lang === 'ar'
            ? 'القياس يقع قرب الحدود الخارجية للنمو المتوقع. يُوصى بتسجيل قياسات دورية لمراقبة مسار النمو.'
            : 'The measurement is near the outer boundary of expected growth. Regular follow-up measurements are recommended to observe trajectory.',
      };
    } else if (absZ > 1.0) {
      return {
        category: 'within_expected',
        label: lang === 'ar' ? 'ضمن المتوقع' : 'Within Expected Range',
        badgeBg: 'bg-emerald-500/10',
        badgeText: 'text-emerald-400',
        badgeBorder: 'border-emerald-500/25',
        dotColor: 'bg-emerald-400',
        iconSymbol: '🟢',
        description:
          lang === 'ar'
            ? 'القياس يقع ضمن النطاق المتوقع وفق معايير منظمة الصحة العالمية لمثل هذا العمر والجنس.'
            : 'The measurement falls within the expected range according to WHO growth standards for this age and sex.',
      };
    } else {
      return {
        category: 'reassuring_growth',
        label: lang === 'ar' ? 'نمو مطمئن' : 'Reassuring Growth',
        badgeBg: 'bg-emerald-500/10',
        badgeText: 'text-emerald-400',
        badgeBorder: 'border-emerald-500/25',
        dotColor: 'bg-emerald-400',
        iconSymbol: '🟢',
        description:
          lang === 'ar'
            ? 'القياس متسق مع وسيط النمو لمنظمة الصحة العالمية ويعكس مساراً متزناً.'
            : 'The measurement aligns closely with WHO growth median, indicating a well-balanced trajectory.',
      };
    }
  }
}

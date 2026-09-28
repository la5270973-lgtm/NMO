/**
 * NMO | نمو — Child Growth Application
 * WHOReferenceSelector (Deterministic)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { AgeCalculationResult, Sex, WHOReferenceName } from '../types/growth.ts';

export interface ReferenceSelectionResult {
  reference: WHOReferenceName;
  version: '2006' | '2007';
  groupFolder: '0-5' | '5-19';
  boundaryNote: string;
  isEligibleForWeightForAge: boolean;
  isEligibleForHeadCircumference: boolean;
  lengthHeightMode: 'recumbent_length' | 'standing_height';
}

export class WHOReferenceSelector {
  /**
   * Transition Rule Documentation:
   * 
   * 1. 0 to 60 completed months (0 to 1856 days, birth up to exact 5.0 completed years):
   *    Evaluated using the WHO Child Growth Standards (2006).
   *    - Uses recumbent length for 0 to <24 months (<731 days).
   *    - Uses standing height for 24 to 60 completed months.
   *    - Head circumference is supported up to 60 completed months (1856 days).
   * 
   * 2. 61 to 228 completed months (5 years 1 month up to 19 years 0 completed months):
   *    Evaluated using the WHO 2007 Growth Reference (5-19 years).
   *    - Always uses standing height.
   *    - Weight-for-age is ONLY supported from 61 to 120 completed months (5 to 10 years).
   *    - Head circumference is NOT applicable (>60 months).
   * 
   * 3. Boundary rule:
   *    A child who has completed 60 months and 0 days (age 5 years 0 days, ageInDays <= 1856)
   *    is assessed under the 0-5 Standards.
   *    Once the child enters the 61st month (age 5 years 1 day or >= 61 completed months),
   *    assessment transitions strictly to the WHO 2007 Growth Reference.
   */
  public static selectReference(
    sex: Sex,
    age: AgeCalculationResult
  ): ReferenceSelectionResult {
    if (!sex || (sex !== 'male' && sex !== 'female')) {
      throw new Error('SEX_REQUIRED: A valid biological sex ("male" or "female") is required for WHO growth assessment.');
    }

    const { totalCompletedMonths, ageInDays } = age;

    if (totalCompletedMonths <= 60 && ageInDays <= 1856) {
      const isUnderTwoYears = ageInDays < 731; // 24 months = 730.5 days
      return {
        reference: 'WHO Child Growth Standards',
        version: '2006',
        groupFolder: '0-5',
        boundaryNote: `Assessed under WHO Child Growth Standards 2006 (0–60 completed months). Exact age: ${age.formattedAge}.`,
        isEligibleForWeightForAge: true,
        isEligibleForHeadCircumference: true,
        lengthHeightMode: isUnderTwoYears ? 'recumbent_length' : 'standing_height',
      };
    } else if (totalCompletedMonths >= 61 && totalCompletedMonths <= 228) {
      const isUnderTenYears = totalCompletedMonths <= 120;
      return {
        reference: 'WHO 2007 Growth Reference',
        version: '2007',
        groupFolder: '5-19',
        boundaryNote: `Assessed under WHO 2007 Growth Reference (5–19 years). Child completed ${totalCompletedMonths} months.`,
        isEligibleForWeightForAge: isUnderTenYears,
        isEligibleForHeadCircumference: false,
        lengthHeightMode: 'standing_height',
      };
    } else if (totalCompletedMonths > 228) {
      throw new Error(`AGE_OUT_OF_RANGE: Age (${totalCompletedMonths} months) exceeds WHO 2007 reference ceiling of 228 completed months (19 years).`);
    } else {
      // Edge cases between day 1856 and month 61: transition to 5-19 reference
      return {
        reference: 'WHO 2007 Growth Reference',
        version: '2007',
        groupFolder: '5-19',
        boundaryNote: `Assessed under WHO 2007 Growth Reference (5–19 years) at month transition.`,
        isEligibleForWeightForAge: true,
        isEligibleForHeadCircumference: false,
        lengthHeightMode: 'standing_height',
      };
    }
  }
}

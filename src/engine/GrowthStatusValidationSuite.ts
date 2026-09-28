/**
 * NMO | نمو — Child Growth Application
 * Phase 2: GrowthStatusValidationSuite
 * Automated Verification & Benchmark Runner for GrowthStatusEngine
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { GrowthStatusEngine } from './GrowthStatusEngine.ts';
import {
  GrowthStatusEngineInput,
  GrowthStatusEngineOutput,
  GrowthStatusLevel,
} from '../types/growthStatus.ts';
import {
  AgeCalculationResult,
  FullGrowthAssessmentResult,
  IndicatorCalculationResult,
  Sex,
} from '../types/growth.ts';

export interface StatusTestCase {
  id: string;
  name: string;
  description: string;
  category:
    | 'current_test_case'
    | 'normal_range'
    | 'low_height'
    | 'high_bmi'
    | 'low_bmi'
    | 'high_wfh'
    | 'low_wfh'
    | 'head_circumference'
    | 'weight_for_age'
    | 'insufficient_data'
    | 'longitudinal'
    | 'boundary_values'
    | 'age_transitions';
  input: GrowthStatusEngineInput;
  expectedStatusLevel: GrowthStatusLevel;
  expectedReasonsSubstring?: string;
  verifyFn?: (output: GrowthStatusEngineOutput) => boolean;
}

export interface StatusTestResult {
  testCase: StatusTestCase;
  output: GrowthStatusEngineOutput;
  passed: boolean;
  notes: string;
}

export interface ValidationSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
  currentTestCaseResult: StatusTestResult;
  results: StatusTestResult[];
}

export class GrowthStatusValidationSuite {
  /**
   * Helper to build mock indicator calculation result with provided Z-scores.
   * Per Section 19: "Do not recalculate them inside the status engine. Use these values as inputs."
   */
  private static mockIndicator(
    indicator: any,
    sex: Sex,
    zScore: number,
    percentile: number,
    measurement: number,
    unit: string,
    ref: any = 'WHO Child Growth Standards',
    refVer: string = '2006'
  ): IndicatorCalculationResult {
    return {
      indicator,
      sex,
      ageInMonths: 27,
      ageInDays: 835,
      measurement,
      measurementUnit: unit,
      zScore,
      zScoreRaw: zScore,
      zScoreDisplayed: (zScore >= 0 ? '+' : '') + zScore.toFixed(2),
      percentile,
      percentileRaw: percentile,
      percentileDisplayed: `${percentile.toFixed(1)}%`,
      reference: ref,
      referenceVersion: refVer,
      source: 'Official WHO Dataset',
      calculatedAt: '2026-09-28T00:00:00Z',
      status: 'VALID',
      metadata: {
        lms: { L: 1.0, M: measurement, S: 0.1 },
        keyUsed: 835,
        interpolated: false,
        extremeAdjustmentApplied: false,
      },
    };
  }

  /**
   * Helper to build age calculation result
   */
  private static mockAge(
    days: number,
    completedYears: number,
    completedMonths: number,
    remainingDays: number
  ): AgeCalculationResult {
    return {
      ageInDays: days,
      ageInMonths: completedMonths,
      ageInYears: completedYears,
      completedYears,
      completedMonths,
      remainingDays,
      totalCompletedMonths: completedMonths,
      formattedAge: `${completedYears} years, ${completedMonths % 12} months`,
      isLeapYearChild: false,
      birthDateISO: '2024-06-15',
      measurementDateISO: '2026-09-28',
    };
  }

  /**
   * The Current Validated Test Case specified in Section 19:
   * Male, DOB: 2024-06-15, Measurement: 2026-09-28, Age: 835 days (2y 3m 13d),
   * Height: 88.5 cm, Weight: 12.5 kg, HC: 48 cm
   * Calculated:
   * HAZ: -0.4495, WAZ: -0.2194, WFH: -0.0296, BAZ: +0.0582, HCZ: -0.481
   */
  public static getCurrentTestCase(): StatusTestCase {
    const age835 = this.mockAge(835, 2, 27, 13);
    return {
      id: 'TC-SEC19-CURRENT-VALIDATED-CASE',
      name: 'Section 19 Benchmark: Validated Male 835 Days',
      description:
        'Male born 2024-06-15 measured 2026-09-28 with height 88.5 cm, weight 12.5 kg, HC 48 cm. Inputs: HAZ=-0.4495, WAZ=-0.2194, WFH=-0.0296, BAZ=+0.0582, HCZ=-0.481.',
      category: 'current_test_case',
      input: {
        childId: 'c-ahmed-benchmark',
        age: age835,
        sex: 'male',
        indicators: {
          heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -0.4495, 32.7, 88.5, 'cm'),
          weightForAge: this.mockIndicator('WEIGHT_FOR_AGE', 'male', -0.2194, 41.3, 12.5, 'kg'),
          weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'male', -0.0296, 48.8, 12.5, 'kg'),
          bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'male', 0.0582, 52.3, 15.96, 'kg/m²'),
          headCircumferenceForAge: this.mockIndicator('HEAD_CIRCUMFERENCE_FOR_AGE', 'male', -0.481, 31.5, 48.0, 'cm'),
        },
        historicalAssessments: [],
      },
      expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
      verifyFn: (out) => {
        // Must verify Section 10 phrasing
        const hasStandardPhrasing =
          out.parentExplanationAr.includes('ضمن النطاق المتوقع وفق مرجع النمو المستخدم') &&
          out.parentExplanationEn.includes('within the expected range of the selected growth reference');

        // Must verify Section 12 phrasing for single measurement
        const hasCorrectTrend =
          out.trend.trendCode === 'insufficient_longitudinal_data' &&
          out.trend.trendLabelAr.includes('بيانات طولية غير كافية');

        // Must evaluate all 5 indicators without averaging
        const hasAllIndicators = out.applicableIndicatorsList.length === 5;

        return hasStandardPhrasing && hasCorrectTrend && hasAllIndicators;
      },
    };
  }

  /**
   * Generates all 28 automated test cases covering Section 18 requirements.
   */
  public static getAllTestCases(): StatusTestCase[] {
    const age835 = this.mockAge(835, 2, 27, 13);
    const age8y = this.mockAge(2922, 8, 96, 0); // 8 years (WHO 2007)
    const age13y = this.mockAge(4748, 13, 156, 0); // 13 years (WHO 2007, WFA invalid)

    const cases: StatusTestCase[] = [
      // 1. Current Test Case (Section 19)
      this.getCurrentTestCase(),

      // 2. Normal-range measurement with stable longitudinal history -> REASSURING_GROWTH
      {
        id: 'TC-02-REASSURING-GROWTH-LONGITUDINAL',
        name: 'Normal Range with Confirmed Stable Longitudinal Trajectory',
        description: 'Child with 2 consecutive measurements in median band without change -> REASSURING_GROWTH',
        category: 'normal_range',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -0.2, 42.1, 88.5, 'cm'),
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'male', -0.1, 46.0, 12.5, 'kg'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'male', 0.0, 50.0, 15.96, 'kg/m²'),
          },
          historicalAssessments: [
            {
              calculationId: 'hist-1',
              age: this.mockAge(700, 1, 23, 0),
              reference: 'WHO Child Growth Standards',
              referenceVersion: '2006',
              auditRecords: [],
              status: 'VALID',
              errors: [],
              heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -0.25, 40.1, 84.0, 'cm'),
            },
            {
              calculationId: 'hist-2',
              age: age835,
              reference: 'WHO Child Growth Standards',
              referenceVersion: '2006',
              auditRecords: [],
              status: 'VALID',
              errors: [],
              heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -0.2, 42.1, 88.5, 'cm'),
            },
          ],
        },
        expectedStatusLevel: 'REASSURING_GROWTH',
      },

      // 3. Low Height-for-Age (Moderate Stunting: < -2 and >= -3) -> NEEDS_FOLLOW_UP
      {
        id: 'TC-03-LOW-HEIGHT-MODERATE-STUNTING',
        name: 'Low Height-for-Age (< -2 SD, Moderate Stunting Range)',
        description: 'Height-for-age Z = -2.45 SD -> NEEDS_FOLLOW_UP',
        category: 'low_height',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -2.45, 0.7, 82.0, 'cm'),
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'male', 0.1, 54.0, 11.8, 'kg'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 4. Severe Low Height-for-Age (< -3 SD, Severe Stunting) -> CONSIDER_MEDICAL_REVIEW
      {
        id: 'TC-04-SEVERE-LOW-HEIGHT-STUNTING',
        name: 'Severe Low Height-for-Age (< -3 SD, Severe Stunting Range)',
        description: 'Height-for-age Z = -3.4 SD -> CONSIDER_MEDICAL_REVIEW',
        category: 'low_height',
        input: {
          age: age835,
          sex: 'female',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'female', -3.4, 0.03, 78.0, 'cm'),
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'female', -0.5, 30.8, 10.2, 'kg'),
          },
        },
        expectedStatusLevel: 'CONSIDER_MEDICAL_REVIEW',
      },

      // 5. High Weight-for-Height 0-5y (> +2 to +3 SD, Overweight) -> NEEDS_FOLLOW_UP
      {
        id: 'TC-05-HIGH-WFH-OVERWEIGHT',
        name: 'Under 5y: Weight-for-Height > +2 SD (Overweight Range)',
        description: 'Weight-for-height Z = +2.4 SD -> NEEDS_FOLLOW_UP',
        category: 'high_wfh',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.0, 50.0, 88.5, 'cm'),
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'male', 2.4, 99.2, 14.8, 'kg'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 6. Severe High Weight-for-Height 0-5y (> +3 SD, Obesity) -> CONSIDER_MEDICAL_REVIEW
      {
        id: 'TC-06-SEVERE-HIGH-WFH-OBESITY',
        name: 'Under 5y: Weight-for-Height > +3 SD (Obesity Range)',
        description: 'Weight-for-height Z = +3.3 SD -> CONSIDER_MEDICAL_REVIEW',
        category: 'high_wfh',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.2, 57.9, 88.5, 'cm'),
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'male', 3.3, 99.9, 16.5, 'kg'),
          },
        },
        expectedStatusLevel: 'CONSIDER_MEDICAL_REVIEW',
      },

      // 7. Low Weight-for-Height 0-5y (< -2 to -3 SD, Wasting Follow-up) -> NEEDS_FOLLOW_UP
      {
        id: 'TC-07-LOW-WFH-WASTING',
        name: 'Under 5y: Weight-for-Height < -2 SD (Wasting Follow-up)',
        description: 'Weight-for-height Z = -2.5 SD -> NEEDS_FOLLOW_UP',
        category: 'low_wfh',
        input: {
          age: age835,
          sex: 'female',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'female', -0.5, 30.8, 87.0, 'cm'),
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'female', -2.5, 0.6, 10.0, 'kg'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 8. Severe Low Weight-for-Height 0-5y (< -3 SD, Severe Wasting) -> CONSIDER_MEDICAL_REVIEW
      {
        id: 'TC-08-SEVERE-LOW-WFH-SEVERE-WASTING',
        name: 'Under 5y: Weight-for-Height < -3 SD (Severe Wasting Range)',
        description: 'Weight-for-height Z = -3.5 SD -> CONSIDER_MEDICAL_REVIEW',
        category: 'low_wfh',
        input: {
          age: age835,
          sex: 'female',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'female', -0.8, 21.2, 87.0, 'cm'),
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'female', -3.5, 0.02, 9.1, 'kg'),
          },
        },
        expectedStatusLevel: 'CONSIDER_MEDICAL_REVIEW',
      },

      // 9. Age 5-19: High BMI-for-Age (> +1 to +2 SD, Overweight) -> NEEDS_FOLLOW_UP
      {
        id: 'TC-09-5TO19-BMI-OVERWEIGHT',
        name: 'Age 5-19y: BMI-for-Age > +1 SD (Overweight Range)',
        description: '8-year-old child with BMI-for-age Z = +1.6 SD -> NEEDS_FOLLOW_UP',
        category: 'high_bmi',
        input: {
          age: age8y,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.2, 57.9, 128.0, 'cm', 'WHO 2007 Growth Reference', '2007'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'male', 1.6, 94.5, 18.2, 'kg/m²', 'WHO 2007 Growth Reference', '2007'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 10. Age 5-19: High BMI-for-Age (> +2 SD, Obesity) -> NEEDS_FOLLOW_UP
      {
        id: 'TC-10-5TO19-BMI-OBESITY',
        name: 'Age 5-19y: BMI-for-Age > +2 SD (Obesity Range)',
        description: '8-year-old child with BMI-for-age Z = +2.4 SD -> NEEDS_FOLLOW_UP',
        category: 'high_bmi',
        input: {
          age: age8y,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.1, 54.0, 128.0, 'cm', 'WHO 2007 Growth Reference', '2007'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'male', 2.4, 99.2, 20.5, 'kg/m²', 'WHO 2007 Growth Reference', '2007'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 11. Age 5-19: Low BMI-for-Age (< -2 to -3 SD, Thinness) -> NEEDS_FOLLOW_UP
      {
        id: 'TC-11-5TO19-BMI-THINNESS',
        name: 'Age 5-19y: BMI-for-Age < -2 SD (Thinness Range)',
        description: '8-year-old child with BMI-for-age Z = -2.3 SD -> NEEDS_FOLLOW_UP',
        category: 'low_bmi',
        input: {
          age: age8y,
          sex: 'female',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'female', -0.5, 30.8, 126.0, 'cm', 'WHO 2007 Growth Reference', '2007'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'female', -2.3, 1.1, 13.1, 'kg/m²', 'WHO 2007 Growth Reference', '2007'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 12. Age 5-19: Severe Low BMI-for-Age (< -3 SD, Severe Thinness) -> CONSIDER_MEDICAL_REVIEW
      {
        id: 'TC-12-5TO19-BMI-SEVERE-THINNESS',
        name: 'Age 5-19y: BMI-for-Age < -3 SD (Severe Thinness Range)',
        description: '8-year-old child with BMI-for-age Z = -3.4 SD -> CONSIDER_MEDICAL_REVIEW',
        category: 'low_bmi',
        input: {
          age: age8y,
          sex: 'female',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'female', -1.0, 15.9, 125.0, 'cm', 'WHO 2007 Growth Reference', '2007'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'female', -3.4, 0.03, 12.0, 'kg/m²', 'WHO 2007 Growth Reference', '2007'),
          },
        },
        expectedStatusLevel: 'CONSIDER_MEDICAL_REVIEW',
      },

      // 13. Substantially Abnormal Head Circumference (|Z| > 3 SD) -> CONSIDER_MEDICAL_REVIEW
      {
        id: 'TC-13-HC-SUBSTANTIALLY-ABNORMAL',
        name: 'Under 5y: Head Circumference |Z| > 3 SD',
        description: 'Head circumference Z = +3.3 SD -> CONSIDER_MEDICAL_REVIEW',
        category: 'head_circumference',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.1, 54.0, 88.5, 'cm'),
            headCircumferenceForAge: this.mockIndicator('HEAD_CIRCUMFERENCE_FOR_AGE', 'male', 3.3, 99.9, 53.5, 'cm'),
          },
        },
        expectedStatusLevel: 'CONSIDER_MEDICAL_REVIEW',
      },

      // 14. Head Circumference Outside Typical Range (|Z| > 2 and <= 3 SD) -> NEEDS_FOLLOW_UP
      {
        id: 'TC-14-HC-OUTSIDE-TYPICAL',
        name: 'Under 5y: Head Circumference |Z| > 2 SD',
        description: 'Head circumference Z = +2.3 SD -> NEEDS_FOLLOW_UP',
        category: 'head_circumference',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.1, 54.0, 88.5, 'cm'),
            headCircumferenceForAge: this.mockIndicator('HEAD_CIRCUMFERENCE_FOR_AGE', 'male', 2.3, 98.9, 51.5, 'cm'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 15. Weight-for-Age Flag for Follow-up (< -2 SD) -> NEEDS_FOLLOW_UP
      {
        id: 'TC-15-WFA-BELOW-REFERENCE',
        name: 'Weight-for-Age < -2 SD (Follow-up Flag)',
        description: 'Weight-for-age Z = -2.3 SD -> NEEDS_FOLLOW_UP',
        category: 'weight_for_age',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -0.5, 30.8, 88.5, 'cm'),
            weightForAge: this.mockIndicator('WEIGHT_FOR_AGE', 'male', -2.3, 1.1, 10.4, 'kg'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 16. Weight-for-Age Over 10 Years Old (Must NOT be used)
      {
        id: 'TC-16-WFA-OVER-10Y-EXCLUDED',
        name: 'Age > 10y: Weight-for-Age Excluded per WHO',
        description: '13-year-old child: WFA must not be used or evaluated as valid indicator',
        category: 'weight_for_age',
        input: {
          age: age13y,
          sex: 'female',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'female', 0.1, 54.0, 158.0, 'cm', 'WHO 2007 Growth Reference', '2007'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'female', 0.2, 57.9, 19.5, 'kg/m²', 'WHO 2007 Growth Reference', '2007'),
            weightForAge: this.mockIndicator('WEIGHT_FOR_AGE', 'female', 0.1, 54.0, 48.0, 'kg', 'WHO 2007 Growth Reference', '2007'),
          },
        },
        expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
        verifyFn: (out) => {
          // Weight-for-age should NOT be in applicableIndicatorsList
          const hasWFA = out.applicableIndicatorsList.some((i) => i.indicator === 'WEIGHT_FOR_AGE');
          return !hasWFA;
        },
      },

      // 17. Head Circumference Over 5 Years (Must NOT be used)
      {
        id: 'TC-17-HC-OVER-5Y-EXCLUDED',
        name: 'Age > 5y: Head Circumference Excluded per WHO',
        description: '8-year-old child: Head circumference must not be applied',
        category: 'head_circumference',
        input: {
          age: age8y,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.2, 57.9, 128.0, 'cm', 'WHO 2007 Growth Reference', '2007'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'male', 0.1, 54.0, 16.5, 'kg/m²', 'WHO 2007 Growth Reference', '2007'),
            headCircumferenceForAge: this.mockIndicator('HEAD_CIRCUMFERENCE_FOR_AGE', 'male', 0.0, 50.0, 52.0, 'cm'),
          },
        },
        expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
        verifyFn: (out) => {
          const hasHC = out.applicableIndicatorsList.some((i) => i.indicator === 'HEAD_CIRCUMFERENCE_FOR_AGE');
          return !hasHC;
        },
      },

      // 18. Insufficient Data Test
      {
        id: 'TC-18-INSUFFICIENT-DATA',
        name: 'Missing Measurements -> DATA_INSUFFICIENT',
        description: 'Input with no valid indicators -> DATA_INSUFFICIENT',
        category: 'insufficient_data',
        input: {
          age: age835,
          sex: 'male',
          indicators: {},
          dataSufficiency: { hasHeight: false, hasWeight: false, hasAge: true, hasSex: true },
        },
        expectedStatusLevel: 'DATA_INSUFFICIENT',
        verifyFn: (out) => {
          return out.parentExplanationAr.includes('أكمل قياسات النمو المطلوبة');
        },
      },

      // 19. One Measurement Only Test (Section 12: Do not claim growth is stable)
      {
        id: 'TC-19-SINGLE-MEASUREMENT-NO-STABLE-CLAIM',
        name: 'Single Measurement -> Does NOT claim growth is stable',
        description: 'Only 1 measurement: Returns WITHIN_EXPECTED_RANGE and asks for future measurements',
        category: 'longitudinal',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.1, 54.0, 88.5, 'cm'),
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'male', 0.0, 50.0, 12.5, 'kg'),
          },
          historicalAssessments: [],
        },
        expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
        verifyFn: (out) => {
          return (
            out.trend.explanationEn.includes('Current measurement is available') &&
            out.trend.hasLongitudinalData === false
          );
        },
      },

      // 20. Longitudinal Consequential Drop (delta Z < -1.0 SD) -> NEEDS_FOLLOW_UP
      {
        id: 'TC-20-LONGITUDINAL-DROP-FOLLOWUP',
        name: 'Longitudinal Trajectory Drop > 1.0 SD -> NEEDS_FOLLOW_UP',
        description: 'Drop from Z = +0.5 to Z = -0.7 (delta = -1.2 SD) -> NEEDS_FOLLOW_UP',
        category: 'longitudinal',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -0.7, 24.2, 87.0, 'cm'),
          },
          historicalAssessments: [
            {
              calculationId: 'h-1',
              age: this.mockAge(500, 1, 16, 0),
              reference: 'WHO Child Growth Standards',
              referenceVersion: '2006',
              auditRecords: [],
              status: 'VALID',
              errors: [],
              heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.5, 69.1, 82.0, 'cm'),
            },
            {
              calculationId: 'h-2',
              age: age835,
              reference: 'WHO Child Growth Standards',
              referenceVersion: '2006',
              auditRecords: [],
              status: 'VALID',
              errors: [],
              heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -0.7, 24.2, 87.0, 'cm'),
            },
          ],
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
        verifyFn: (out) => {
          return (
            out.trend.trendCode === 'concerning_drop' &&
            out.trend.explanationAr.includes('تُظهر القياسات الأخيرة تغيراً في مسار النمو المسجل')
          );
        },
      },

      // 21. Boundary Value at Z = -3.00 SD
      {
        id: 'TC-21-BOUNDARY-Z-MINUS-3',
        name: 'Boundary Value: Exactly Z = -3.00 SD',
        description: 'At exactly -3.00 SD: classified as -2 to -3 range (follow-up), not < -3',
        category: 'boundary_values',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -3.0, 0.13, 80.0, 'cm'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 22. Boundary Value at Z = -2.00 SD
      {
        id: 'TC-22-BOUNDARY-Z-MINUS-2',
        name: 'Boundary Value: Exactly Z = -2.00 SD',
        description: 'At exactly -2.00 SD: considered within expected reference range',
        category: 'boundary_values',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', -2.0, 2.3, 83.0, 'cm'),
          },
        },
        expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
      },

      // 23. Boundary Value at Z = +1.00 SD for 5-19y BMI
      {
        id: 'TC-23-BOUNDARY-Z-PLUS-1-5TO19',
        name: 'Boundary Value: 5-19y BMI at Exactly Z = +1.00 SD',
        description: 'At exactly +1.00 SD: within expected range (overweight is > +1)',
        category: 'boundary_values',
        input: {
          age: age8y,
          sex: 'female',
          indicators: {
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'female', 1.0, 84.1, 17.0, 'kg/m²', 'WHO 2007 Growth Reference', '2007'),
          },
        },
        expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
      },

      // 24. Boundary Value at Z = +2.00 SD for Under 5y WFH
      {
        id: 'TC-24-BOUNDARY-Z-PLUS-2-WFH',
        name: 'Boundary Value: Under 5y WFH at Exactly Z = +2.00 SD',
        description: 'At exactly +2.00 SD: within expected range (overweight is > +2)',
        category: 'boundary_values',
        input: {
          age: age835,
          sex: 'female',
          indicators: {
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'female', 2.0, 97.7, 14.0, 'kg'),
          },
        },
        expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
      },

      // 25. Boundary Value at Z = +3.00 SD for Under 5y WFH
      {
        id: 'TC-25-BOUNDARY-Z-PLUS-3-WFH',
        name: 'Boundary Value: Under 5y WFH at Exactly Z = +3.00 SD',
        description: 'At exactly +3.00 SD: overweight range (> +2 to +3), obesity is > +3',
        category: 'boundary_values',
        input: {
          age: age835,
          sex: 'male',
          indicators: {
            weightForLengthOrHeight: this.mockIndicator('WEIGHT_FOR_HEIGHT', 'male', 3.0, 99.87, 15.9, 'kg'),
          },
        },
        expectedStatusLevel: 'NEEDS_FOLLOW_UP',
      },

      // 26. Age Transition: Under 5 Years Girl
      {
        id: 'TC-26-AGE-TRANSITION-UNDER-5-GIRL',
        name: 'Age Transition: Girl 3 Years Old (Under 5y Standards)',
        description: 'Girl 36 months under WHO 2006 Standards with normal metrics',
        category: 'age_transitions',
        input: {
          age: this.mockAge(1095, 3, 36, 0),
          sex: 'female',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'female', 0.1, 54.0, 95.2, 'cm'),
            weightForAge: this.mockIndicator('WEIGHT_FOR_AGE', 'female', 0.2, 57.9, 14.1, 'kg'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'female', 0.0, 50.0, 15.5, 'kg/m²'),
          },
        },
        expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
      },

      // 27. Age Transition: 5-10 Years Boy (WFA Valid)
      {
        id: 'TC-27-AGE-TRANSITION-5TO10-BOY',
        name: 'Age Transition: Boy 7 Years (5-10y, WFA Valid)',
        description: 'Boy 84 months under WHO 2007: WFA is valid and included',
        category: 'age_transitions',
        input: {
          age: this.mockAge(2556, 7, 84, 0),
          sex: 'male',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'male', 0.1, 54.0, 122.0, 'cm', 'WHO 2007 Growth Reference', '2007'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'male', 0.2, 57.9, 15.8, 'kg/m²', 'WHO 2007 Growth Reference', '2007'),
            weightForAge: this.mockIndicator('WEIGHT_FOR_AGE', 'male', 0.1, 54.0, 23.5, 'kg', 'WHO 2007 Growth Reference', '2007'),
          },
        },
        expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
        verifyFn: (out) => {
          return out.applicableIndicatorsList.some((i) => i.indicator === 'WEIGHT_FOR_AGE');
        },
      },

      // 28. Age Transition: 10-19 Years Girl (WFA Excluded)
      {
        id: 'TC-28-AGE-TRANSITION-10TO19-GIRL',
        name: 'Age Transition: Girl 14 Years (10-19y, WFA Excluded)',
        description: 'Girl 168 months under WHO 2007: WFA is excluded and head circumference is excluded',
        category: 'age_transitions',
        input: {
          age: this.mockAge(5113, 14, 168, 0),
          sex: 'female',
          indicators: {
            heightLength: this.mockIndicator('HEIGHT_FOR_AGE', 'female', 0.3, 61.8, 161.0, 'cm', 'WHO 2007 Growth Reference', '2007'),
            bmiForAge: this.mockIndicator('BMI_FOR_AGE', 'female', 0.1, 54.0, 20.1, 'kg/m²', 'WHO 2007 Growth Reference', '2007'),
            weightForAge: this.mockIndicator('WEIGHT_FOR_AGE', 'female', 0.2, 57.9, 52.0, 'kg', 'WHO 2007 Growth Reference', '2007'),
          },
        },
        expectedStatusLevel: 'WITHIN_EXPECTED_RANGE',
        verifyFn: (out) => {
          const hasWFA = out.applicableIndicatorsList.some((i) => i.indicator === 'WEIGHT_FOR_AGE');
          const hasHC = out.applicableIndicatorsList.some((i) => i.indicator === 'HEAD_CIRCUMFERENCE_FOR_AGE');
          return !hasWFA && !hasHC;
        },
      },
    ];

    return cases;
  }

  /**
   * Runs all validation test cases and returns comprehensive results.
   */
  public static runAllTests(): ValidationSuiteSummary {
    const testCases = this.getAllTestCases();
    const results: StatusTestResult[] = [];
    let passedCount = 0;

    for (const tc of testCases) {
      const output = GrowthStatusEngine.evaluate(tc.input, 'ar');
      const statusMatches = output.statusLevel === tc.expectedStatusLevel;
      let customVerifyPassed = true;

      if (tc.verifyFn) {
        customVerifyPassed = tc.verifyFn(output);
      }

      const passed = statusMatches && customVerifyPassed;
      if (passed) passedCount++;

      let notes = `Status: ${output.statusLevel} (Expected: ${tc.expectedStatusLevel}).`;
      if (!statusMatches) {
        notes += ` FAILED: Expected ${tc.expectedStatusLevel} but got ${output.statusLevel}.`;
      }
      if (!customVerifyPassed) {
        notes += ` FAILED: Custom verification condition not satisfied.`;
      }

      results.push({
        testCase: tc,
        output,
        passed,
        notes,
      });
    }

    const currentTestCaseResult = results[0];

    return {
      total: testCases.length,
      passed: passedCount,
      failed: testCases.length - passedCount,
      passRate: `${((passedCount / testCases.length) * 100).toFixed(1)}%`,
      currentTestCaseResult,
      results,
    };
  }
}

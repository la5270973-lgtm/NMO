/**
 * NMO | نمو — Child Growth Application
 * WHOValidationSuite (Official WHO Benchmark & Test Runner)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { ValidationTestCase, ValidationTestResult } from '../types/growth.ts';
import { AgeCalculator } from './AgeCalculator.ts';
import { IndicatorEngine } from './IndicatorEngine.ts';
import { WHOGrowthEngine } from './WHOGrowthEngine.ts';

export const OFFICIAL_VALIDATION_TEST_CASES: ValidationTestCase[] = [
  // --- MALE CASES (10 cases across 7 age brackets) ---
  {
    id: 'M-01',
    name: 'Male Newborn (Birth Day 0) — Median Length',
    description: 'Validates day 0 length-for-age against official WHO standard median (49.88 cm = 0 SD).',
    sex: 'male',
    dateOfBirth: '2026-01-01',
    measurementDate: '2026-01-01',
    heightLengthCm: 49.88,
    measurementPosition: 'recumbent',
    ageBand: '0–6 months',
    category: 'median',
    expectedIndicator: 'LENGTH_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'M-02',
    name: 'Male 3 Months — Weight -2 SD (Low)',
    description: 'Validates 3m (day 91) weight-for-age against WHO SD2neg cut-off (5.01 kg = -2.0 SD).',
    sex: 'male',
    dateOfBirth: '2025-10-02',
    measurementDate: '2026-01-01', // 91 days
    weightKg: 5.01,
    ageBand: '0–6 months',
    category: 'low',
    expectedIndicator: 'WEIGHT_FOR_AGE',
    expectedZScore: -2.0,
    expectedPercentile: 2.28,
    tolerance: 0.05,
  },
  {
    id: 'M-03',
    name: 'Male 9 Months — Weight +2 SD (High)',
    description: 'Validates 9m (day 274) weight-for-age against official WHO SD2 cut-off (11.04 kg = +2.0 SD).',
    sex: 'male',
    dateOfBirth: '2025-04-02',
    measurementDate: '2026-01-01', // 274 days
    weightKg: 11.04,
    ageBand: '6–12 months',
    category: 'high',
    expectedIndicator: 'WEIGHT_FOR_AGE',
    expectedZScore: 2.0,
    expectedPercentile: 97.72,
    tolerance: 0.05,
  },
  {
    id: 'M-04',
    name: 'Male 18 Months — Weight-for-Length Median',
    description: 'Validates 18m male with length 82.3 cm and median weight (10.89 kg = 0 SD).',
    sex: 'male',
    dateOfBirth: '2024-07-02',
    measurementDate: '2026-01-01', // 548 days
    weightKg: 10.89,
    heightLengthCm: 82.3,
    measurementPosition: 'recumbent',
    ageBand: '1–2 years',
    category: 'median',
    expectedIndicator: 'WEIGHT_FOR_LENGTH',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'M-05',
    name: 'Male 24 Months (Boundary) — Standing Height Median',
    description: 'Boundary at 24 months (732 days); official WHO median standing height (87.16 cm = 0 SD).',
    sex: 'male',
    dateOfBirth: '2023-12-31',
    measurementDate: '2026-01-01', // 732 days = 24 completed months
    heightLengthCm: 87.16,
    measurementPosition: 'standing',
    ageBand: '2–5 years',
    category: 'boundary',
    expectedIndicator: 'HEIGHT_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'M-06',
    name: 'Male 60 Months (0-5 Boundary) — Height-for-Age Median',
    description: 'Official WHO 0-5 ceiling boundary at exactly 60 completed months (day 1826: median height 109.96 cm).',
    sex: 'male',
    dateOfBirth: '2021-01-01',
    measurementDate: '2026-01-01', // 1826 days
    heightLengthCm: 109.96,
    measurementPosition: 'standing',
    ageBand: '2–5 years',
    category: 'boundary',
    expectedIndicator: 'HEIGHT_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'M-07',
    name: 'Male 6 Years (Month 72) — Height-for-Age Median (WHO 2007)',
    description: 'Validates WHO 2007 Reference at 72 completed months (median height 115.95 cm = 0 SD).',
    sex: 'male',
    dateOfBirth: '2020-01-01',
    measurementDate: '2026-01-01', // 72 completed months
    heightLengthCm: 115.95,
    ageBand: '5–10 years',
    category: 'median',
    expectedIndicator: 'HEIGHT_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'M-08',
    name: 'Male 9 Years (Month 108) — Weight-for-Age Median',
    description: 'Validates WHO 2007 weight-for-age for 5-10 years (month 108: median weight 28.1 kg = 0 SD).',
    sex: 'male',
    dateOfBirth: '2017-01-01',
    measurementDate: '2026-01-01', // 108 completed months
    weightKg: 28.1,
    ageBand: '5–10 years',
    category: 'median',
    expectedIndicator: 'WEIGHT_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.08,
  },
  {
    id: 'M-09',
    name: 'Male 13 Years (Month 156) — BMI-for-Age Median',
    description: 'Validates adolescent WHO 2007 BMI-for-age (month 156: median BMI 18.23 kg/m² = 0 SD).',
    sex: 'male',
    dateOfBirth: '2013-01-01',
    measurementDate: '2026-01-01', // 156 completed months
    weightKg: 44.4,
    heightLengthCm: 156.0, // BMI = 44.4 / (1.56^2) = 18.24
    ageBand: '10–15 years',
    category: 'median',
    expectedIndicator: 'BMI_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'M-10',
    name: 'Male 19 Years (Month 228) — Ceiling Boundary Height',
    description: 'Official WHO 2007 upper boundary at 228 months (median height 176.54 cm = 0 SD).',
    sex: 'male',
    dateOfBirth: '2007-01-01',
    measurementDate: '2026-01-01', // 228 completed months
    heightLengthCm: 176.54,
    ageBand: '15–19 years',
    category: 'boundary',
    expectedIndicator: 'HEIGHT_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },

  // --- FEMALE CASES (10 cases across 7 age brackets) ---
  {
    id: 'F-01',
    name: 'Female Newborn (Birth Day 0) — Median Head Circumference',
    description: 'Validates day 0 female head circumference against WHO median (33.88 cm = 0 SD).',
    sex: 'female',
    dateOfBirth: '2026-01-01',
    measurementDate: '2026-01-01',
    headCircumferenceCm: 33.88,
    ageBand: '0–6 months',
    category: 'median',
    expectedIndicator: 'HEAD_CIRCUMFERENCE_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'F-02',
    name: 'Female 2 Months — Weight-for-Age +2 SD (High)',
    description: 'Validates 2m (day 61) female weight at official WHO SD2 cut-off (6.63 kg = +2.0 SD).',
    sex: 'female',
    dateOfBirth: '2025-11-01',
    measurementDate: '2026-01-01', // 61 days
    weightKg: 6.63,
    ageBand: '0–6 months',
    category: 'high',
    expectedIndicator: 'WEIGHT_FOR_AGE',
    expectedZScore: 2.0,
    expectedPercentile: 97.72,
    tolerance: 0.05,
  },
  {
    id: 'F-03',
    name: 'Female 9 Months — Length-for-Age -2 SD (Low)',
    description: 'Validates 9m (day 274) female length at official WHO SD2neg cut-off (65.3 cm = -2.0 SD).',
    sex: 'female',
    dateOfBirth: '2025-04-02',
    measurementDate: '2026-01-01', // 274 days
    heightLengthCm: 65.3,
    measurementPosition: 'recumbent',
    ageBand: '6–12 months',
    category: 'low',
    expectedIndicator: 'LENGTH_FOR_AGE',
    expectedZScore: -2.0,
    expectedPercentile: 2.28,
    tolerance: 0.05,
  },
  {
    id: 'F-04',
    name: 'Female 15 Months — BMI-for-Age Median',
    description: 'Validates 15m (day 456) female BMI at official WHO median (16.00 kg/m² = 0 SD).',
    sex: 'female',
    dateOfBirth: '2024-10-02',
    measurementDate: '2026-01-01', // 456 days
    weightKg: 9.91,
    heightLengthCm: 78.7, // BMI = 9.91 / (0.787^2) = 16.00 kg/m²
    measurementPosition: 'recumbent',
    ageBand: '1–2 years',
    category: 'median',
    expectedIndicator: 'BMI_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'F-05',
    name: 'Female 36 Months — Standing Height Median',
    description: 'Validates 36m (day 1096) female height against WHO median (95.06 cm = 0 SD).',
    sex: 'female',
    dateOfBirth: '2023-01-01',
    measurementDate: '2026-01-01', // 1096 days = 36 completed months
    heightLengthCm: 95.06,
    measurementPosition: 'standing',
    ageBand: '2–5 years',
    category: 'median',
    expectedIndicator: 'HEIGHT_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'F-06',
    name: 'Female 48 Months — Weight-for-Height Median',
    description: 'Validates 4-year-old female height 102.7 cm and median weight (16.1 kg = 0 SD).',
    sex: 'female',
    dateOfBirth: '2022-01-01',
    measurementDate: '2026-01-01', // 48 completed months
    weightKg: 16.1,
    heightLengthCm: 102.7,
    measurementPosition: 'standing',
    ageBand: '2–5 years',
    category: 'median',
    expectedIndicator: 'WEIGHT_FOR_HEIGHT',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.08,
  },
  {
    id: 'F-07',
    name: 'Female 8 Years (Month 96) — Height-for-Age Median',
    description: 'Validates WHO 2007 Reference at 96 completed months (median height 126.64 cm = 0 SD).',
    sex: 'female',
    dateOfBirth: '2018-01-01',
    measurementDate: '2026-01-01', // 96 completed months
    heightLengthCm: 126.64,
    ageBand: '5–10 years',
    category: 'median',
    expectedIndicator: 'HEIGHT_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
  {
    id: 'F-08',
    name: 'Female 10 Years (Month 120) — Weight-for-Age Ceiling Boundary',
    description: 'Boundary for WHO weight-for-age at 120 completed months (median weight 31.9 kg = 0 SD).',
    sex: 'female',
    dateOfBirth: '2016-01-01',
    measurementDate: '2026-01-01', // 120 completed months
    weightKg: 31.9,
    ageBand: '5–10 years',
    category: 'boundary',
    expectedIndicator: 'WEIGHT_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.08,
  },
  {
    id: 'F-09',
    name: 'Female 14 Years (Month 168) — Height-for-Age +2 SD (Tall)',
    description: 'Validates adolescent female height at official WHO +2 SD cut-off (173.68 cm = +2.0 SD).',
    sex: 'female',
    dateOfBirth: '2012-01-01',
    measurementDate: '2026-01-01', // 168 completed months
    heightLengthCm: 173.68,
    ageBand: '10–15 years',
    category: 'high',
    expectedIndicator: 'HEIGHT_FOR_AGE',
    expectedZScore: 2.0,
    expectedPercentile: 97.72,
    tolerance: 0.05,
  },
  {
    id: 'F-10',
    name: 'Female 17 Years (Month 204) — BMI-for-Age Median',
    description: 'Validates late adolescent female BMI at WHO 2007 median (21.04 kg/m² = 0 SD).',
    sex: 'female',
    dateOfBirth: '2009-01-01',
    measurementDate: '2026-01-01', // 204 completed months
    weightKg: 55.7,
    heightLengthCm: 162.8, // BMI = 55.7 / (1.628^2) = 21.02
    ageBand: '15–19 years',
    category: 'median',
    expectedIndicator: 'BMI_FOR_AGE',
    expectedZScore: 0.0,
    expectedPercentile: 50.0,
    tolerance: 0.05,
  },
];

export class WHOValidationSuite {
  /**
   * Runs all validation benchmark test cases and returns structured results with PASS/FAIL.
   */
  public static runAllTests(): {
    total: number;
    passed: number;
    failed: number;
    results: ValidationTestResult[];
    maxDifference: number;
  } {
    const results: ValidationTestResult[] = [];
    let passed = 0;
    let failed = 0;
    let maxDifference = 0;

    for (const test of OFFICIAL_VALIDATION_TEST_CASES) {
      try {
        const age = AgeCalculator.calculate(test.dateOfBirth, test.measurementDate);
        let calculatedZScore: number | undefined;
        let calculatedPercentile: number | undefined;
        let status: 'VALID' | 'WHO_DATA_MISSING' | 'AGE_OUT_OF_RANGE' | 'INVALID_MEASUREMENT' | 'SEX_REQUIRED' | 'INVALID_DATE' | 'INVALID_MEASUREMENT_DATE' | 'NOT_APPLICABLE' = 'VALID';

        switch (test.expectedIndicator) {
          case 'LENGTH_FOR_AGE':
          case 'HEIGHT_FOR_AGE': {
            const res = IndicatorEngine.calculateHeightForAge(
              test.sex,
              age,
              test.heightLengthCm || 0,
              test.measurementPosition
            );
            calculatedZScore = res.zScore;
            calculatedPercentile = res.percentile;
            status = res.status;
            break;
          }
          case 'WEIGHT_FOR_AGE': {
            const res = IndicatorEngine.calculateWeightForAge(test.sex, age, test.weightKg || 0);
            calculatedZScore = res.zScore;
            calculatedPercentile = res.percentile;
            status = res.status;
            break;
          }
          case 'WEIGHT_FOR_LENGTH': {
            const res = IndicatorEngine.calculateWeightForLength(
              test.sex,
              age,
              test.weightKg || 0,
              test.heightLengthCm || 0
            );
            calculatedZScore = res.zScore;
            calculatedPercentile = res.percentile;
            status = res.status;
            break;
          }
          case 'WEIGHT_FOR_HEIGHT': {
            const res = IndicatorEngine.calculateWeightForHeight(
              test.sex,
              age,
              test.weightKg || 0,
              test.heightLengthCm || 0
            );
            calculatedZScore = res.zScore;
            calculatedPercentile = res.percentile;
            status = res.status;
            break;
          }
          case 'BMI_FOR_AGE': {
            const res = IndicatorEngine.calculateBMIForAge(
              test.sex,
              age,
              test.weightKg || 0,
              test.heightLengthCm || 0,
              test.measurementPosition
            );
            calculatedZScore = res.zScore;
            calculatedPercentile = res.percentile;
            status = res.status;
            break;
          }
          case 'HEAD_CIRCUMFERENCE_FOR_AGE': {
            const res = IndicatorEngine.calculateHeadCircumferenceForAge(
              test.sex,
              age,
              test.headCircumferenceCm || 0
            );
            calculatedZScore = res.zScore;
            calculatedPercentile = res.percentile;
            status = res.status;
            break;
          }
        }

        const zDiff = Math.abs((calculatedZScore ?? 0) - test.expectedZScore);
        if (zDiff > maxDifference) {
          maxDifference = zDiff;
        }

        const isPass = zDiff <= test.tolerance && status === 'VALID';
        if (isPass) {
          passed += 1;
        } else {
          failed += 1;
        }

        results.push({
          testCase: test,
          calculatedZScore,
          calculatedPercentile,
          zDifference: Number(zDiff.toFixed(4)),
          passed: isPass,
          status,
          notes: isPass
            ? `PASS: Diff (${zDiff.toFixed(4)}) <= tolerance (${test.tolerance})`
            : `FAIL: Diff (${zDiff.toFixed(4)}) exceeded tolerance (${test.tolerance}) or status was ${status}`,
        });
      } catch (err: unknown) {
        failed += 1;
        results.push({
          testCase: test,
          passed: false,
          status: 'WHO_DATA_MISSING',
          notes: `Exception: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    return {
      total: OFFICIAL_VALIDATION_TEST_CASES.length,
      passed,
      failed,
      results,
      maxDifference: Number(maxDifference.toFixed(4)),
    };
  }

  /**
   * Tests error states handling (Section 18).
   */
  public static runErrorHandlingTests(): { testName: string; passed: boolean; message: string }[] {
    const errorTests: { testName: string; passed: boolean; message: string }[] = [];

    // Test 1: Measurement date precedes birth
    try {
      AgeCalculator.calculate('2026-05-10', '2026-01-01');
      errorTests.push({ testName: 'Measurement before birth', passed: false, message: 'Failed to throw error' });
    } catch (e: unknown) {
      const isCorrect = e instanceof Error && (e.message.includes('precede') || e.message.includes('INVALID_MEASUREMENT_DATE'));
      errorTests.push({
        testName: 'Measurement before birth rejects with INVALID_MEASUREMENT_DATE',
        passed: isCorrect,
        message: e instanceof Error ? e.message : String(e),
      });
    }

    // Test 2: Missing sex
    try {
      // @ts-expect-error test invalid sex
      WHOGrowthEngine.assessGrowth({ sex: '', dateOfBirth: '2025-01-01', measurementDate: '2026-01-01' });
      errorTests.push({ testName: 'Missing sex validation', passed: false, message: 'Failed to throw error' });
    } catch (e: unknown) {
      const isCorrect = e instanceof Error && e.message.includes('SEX_REQUIRED');
      errorTests.push({
        testName: 'Missing sex rejects with SEX_REQUIRED',
        passed: isCorrect,
        message: e instanceof Error ? e.message : String(e),
      });
    }

    // Test 3: Age > 19 years
    try {
      WHOGrowthEngine.assessGrowth({
        sex: 'male',
        dateOfBirth: '2000-01-01',
        measurementDate: '2026-01-01', // 26 years
      });
      errorTests.push({ testName: 'Age > 19 years', passed: false, message: 'Failed to throw error' });
    } catch (e: unknown) {
      const isCorrect = e instanceof Error && e.message.includes('AGE_OUT_OF_RANGE');
      errorTests.push({
        testName: 'Age > 19 years rejects with AGE_OUT_OF_RANGE',
        passed: isCorrect,
        message: e instanceof Error ? e.message : String(e),
      });
    }

    // Test 4: Head circumference > 5 years is marked NOT_APPLICABLE
    try {
      const age = AgeCalculator.calculate('2018-01-01', '2026-01-01'); // 8 years
      const hcRes = IndicatorEngine.calculateHeadCircumferenceForAge('female', age, 52.0);
      const isCorrect = hcRes.status === 'NOT_APPLICABLE';
      errorTests.push({
        testName: 'Head circumference > 5 years returns NOT_APPLICABLE',
        passed: isCorrect,
        message: hcRes.errorMessage || 'Correctly marked not applicable',
      });
    } catch (e: unknown) {
      errorTests.push({ testName: 'Head circumference > 5 years', passed: false, message: String(e) });
    }

    // Test 5: Weight-for-age > 10 years is marked NOT_APPLICABLE
    try {
      const age = AgeCalculator.calculate('2014-01-01', '2026-01-01'); // 12 years
      const wfaRes = IndicatorEngine.calculateWeightForAge('male', age, 42.0);
      const isCorrect = wfaRes.status === 'NOT_APPLICABLE';
      errorTests.push({
        testName: 'Weight-for-age > 10 years returns NOT_APPLICABLE',
        passed: isCorrect,
        message: wfaRes.errorMessage || 'Correctly marked not applicable',
      });
    } catch (e: unknown) {
      errorTests.push({ testName: 'Weight-for-age > 10 years', passed: false, message: String(e) });
    }

    return errorTests;
  }
}

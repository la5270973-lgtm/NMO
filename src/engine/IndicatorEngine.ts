/**
 * NMO | نمو — Child Growth Application
 * IndicatorEngine (Deterministic WHO Indicator Calculation)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import { WHODatasetRegistry } from '../data/who/index.ts';
import {
  AgeCalculationResult,
  IndicatorCalculationResult,
  IndicatorType,
  MeasurementPosition,
  Sex,
} from '../types/growth.ts';
import { WHOReferenceSelector } from './WHOReferenceSelector.ts';
import { ZScoreEngine } from './ZScoreEngine.ts';

export class IndicatorEngine {
  /**
   * Section 8: Length vs Height Conversion Rule
   * - Under 2 years (<731 days / 24 months): standard measurement is recumbent length.
   *   If child was measured standing, WHO recommends: length = standingHeight + 0.7 cm.
   * - 2 to 5 years (>=731 days): standard measurement is standing height.
   *   If child was measured recumbent/lying down, WHO recommends: height = recumbentLength - 0.7 cm.
   * - 5 to 19 years: always standing height.
   */
  public static normalizeLengthHeight(
    rawMeasureCm: number,
    age: AgeCalculationResult,
    position: MeasurementPosition = 'auto'
  ): {
    normalizedCm: number;
    effectivePosition: 'recumbent' | 'standing';
    wasAdjusted: boolean;
    adjustmentNote?: string;
  } {
    const isUnderTwo = age.ageInDays < 731;

    if (position === 'standing' && isUnderTwo) {
      // Child under 2 measured standing: add 0.7 cm to estimate recumbent length
      const adjusted = Number((rawMeasureCm + 0.7).toFixed(2));
      return {
        normalizedCm: adjusted,
        effectivePosition: 'recumbent',
        wasAdjusted: true,
        adjustmentNote: `Child under 2 years measured standing (${rawMeasureCm} cm). Adjusted by +0.7 cm to recumbent length (${adjusted} cm) per official WHO Child Growth Standards methodology.`,
      };
    } else if (position === 'recumbent' && !isUnderTwo && age.totalCompletedMonths <= 60) {
      // Child 2-5 measured lying down: subtract 0.7 cm to estimate standing height
      const adjusted = Number((rawMeasureCm - 0.7).toFixed(2));
      return {
        normalizedCm: adjusted,
        effectivePosition: 'standing',
        wasAdjusted: true,
        adjustmentNote: `Child aged 2–5 years measured recumbent (${rawMeasureCm} cm). Adjusted by -0.7 cm to standing height (${adjusted} cm) per official WHO Child Growth Standards methodology.`,
      };
    }

    return {
      normalizedCm: rawMeasureCm,
      effectivePosition: isUnderTwo ? 'recumbent' : 'standing',
      wasAdjusted: false,
    };
  }

  /**
   * Length-for-age (0–24m) or Height-for-age (24m–19y)
   */
  public static calculateHeightForAge(
    sex: Sex,
    age: AgeCalculationResult,
    heightLengthCm: number,
    position: MeasurementPosition = 'auto'
  ): IndicatorCalculationResult {
    const calculatedAt = new Date().toISOString();
    const isUnderTwo = age.ageInDays < 731;
    const indicatorName: IndicatorType = isUnderTwo ? 'LENGTH_FOR_AGE' : 'HEIGHT_FOR_AGE';

    if (heightLengthCm <= 0 || heightLengthCm > 250) {
      return this.createErrorResult(
        indicatorName,
        sex,
        age,
        heightLengthCm,
        'cm',
        'INVALID_MEASUREMENT',
        `Invalid height/length value: ${heightLengthCm} cm. Must be positive and realistic.`
      );
    }

    const { normalizedCm, wasAdjusted, adjustmentNote } = this.normalizeLengthHeight(heightLengthCm, age, position);
    const refSelection = WHOReferenceSelector.selectReference(sex, age);

    try {
      const dataset = WHODatasetRegistry.getDataset(refSelection.groupFolder, indicatorName, sex);
      const keyVal = refSelection.groupFolder === '0-5' ? age.ageInDays : age.ageInMonths;
      const { lms, interpolated, keyUsed } = WHODatasetRegistry.findLMS(dataset, keyVal);
      const zResult = ZScoreEngine.calculate(normalizedCm, lms, indicatorName);

      return {
        indicator: indicatorName,
        sex,
        ageInMonths: age.ageInMonths,
        ageInDays: age.ageInDays,
        measurement: normalizedCm,
        measurementUnit: 'cm',
        zScore: zResult.zScore,
        zScoreRaw: zResult.zScoreRaw,
        zScoreDisplayed: zResult.zScoreDisplayed,
        percentile: zResult.percentile,
        percentileRaw: zResult.percentileRaw,
        percentileDisplayed: zResult.percentileDisplayed,
        reference: refSelection.reference,
        referenceVersion: refSelection.version,
        source: 'WHO',
        calculatedAt,
        status: 'VALID',
        metadata: {
          lms: { L: lms.L, M: lms.M, S: lms.S },
          keyUsed,
          interpolated,
          extremeAdjustmentApplied: zResult.extremeAdjustmentApplied,
          positionAdjustmentApplied: wasAdjusted
            ? {
                originalValue: heightLengthCm,
                adjustedValue: normalizedCm,
                rule: adjustmentNote || '',
              }
            : undefined,
          notes: adjustmentNote || zResult.methodologyNotes,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.createErrorResult(indicatorName, sex, age, heightLengthCm, 'cm', 'WHO_DATA_MISSING', msg);
    }
  }

  /**
   * Weight-for-age
   * - 0–60 completed months: WHO Child Growth Standards
   * - 61–120 completed months (5–10 years): WHO 2007 Reference
   * - >120 completed months (>10 years): NOT APPLICABLE
   */
  public static calculateWeightForAge(
    sex: Sex,
    age: AgeCalculationResult,
    weightKg: number
  ): IndicatorCalculationResult {
    const calculatedAt = new Date().toISOString();
    const indicatorName: IndicatorType = 'WEIGHT_FOR_AGE';

    if (weightKg <= 0 || weightKg > 200) {
      return this.createErrorResult(
        indicatorName,
        sex,
        age,
        weightKg,
        'kg',
        'INVALID_MEASUREMENT',
        `Invalid weight value: ${weightKg} kg.`
      );
    }

    if (age.totalCompletedMonths > 120) {
      return {
        indicator: indicatorName,
        sex,
        ageInMonths: age.ageInMonths,
        ageInDays: age.ageInDays,
        measurement: weightKg,
        measurementUnit: 'kg',
        zScore: 0,
        zScoreRaw: 0,
        zScoreDisplayed: 'N/A',
        percentile: 0,
        percentileRaw: 0,
        percentileDisplayed: 'Not applicable',
        reference: 'WHO 2007 Growth Reference',
        referenceVersion: '2007',
        source: 'WHO',
        calculatedAt,
        status: 'NOT_APPLICABLE',
        errorMessage: 'Weight-for-age is not provided for children over 10 years (120 completed months) by WHO because it cannot distinguish between height variation and body mass during the adolescent growth spurt. Use BMI-for-age.',
        metadata: {
          lms: { L: 0, M: 0, S: 0 },
          keyUsed: age.totalCompletedMonths,
          interpolated: false,
          extremeAdjustmentApplied: false,
          notes: 'WHO official recommendation: Assess BMI-for-age for children > 10 years.',
        },
      };
    }

    const refSelection = WHOReferenceSelector.selectReference(sex, age);

    try {
      const dataset = WHODatasetRegistry.getDataset(refSelection.groupFolder, indicatorName, sex);
      const keyVal = refSelection.groupFolder === '0-5' ? age.ageInDays : age.ageInMonths;
      const { lms, interpolated, keyUsed } = WHODatasetRegistry.findLMS(dataset, keyVal);
      const zResult = ZScoreEngine.calculate(weightKg, lms, indicatorName);

      return {
        indicator: indicatorName,
        sex,
        ageInMonths: age.ageInMonths,
        ageInDays: age.ageInDays,
        measurement: weightKg,
        measurementUnit: 'kg',
        zScore: zResult.zScore,
        zScoreRaw: zResult.zScoreRaw,
        zScoreDisplayed: zResult.zScoreDisplayed,
        percentile: zResult.percentile,
        percentileRaw: zResult.percentileRaw,
        percentileDisplayed: zResult.percentileDisplayed,
        reference: refSelection.reference,
        referenceVersion: refSelection.version,
        source: 'WHO',
        calculatedAt,
        status: 'VALID',
        metadata: {
          lms: { L: lms.L, M: lms.M, S: lms.S },
          keyUsed,
          interpolated,
          extremeAdjustmentApplied: zResult.extremeAdjustmentApplied,
          notes: zResult.methodologyNotes,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.createErrorResult(indicatorName, sex, age, weightKg, 'kg', 'WHO_DATA_MISSING', msg);
    }
  }

  /**
   * Weight-for-length (Birth to <24 months, 45.0 cm to 110.0 cm)
   */
  public static calculateWeightForLength(
    sex: Sex,
    age: AgeCalculationResult,
    weightKg: number,
    lengthCm: number
  ): IndicatorCalculationResult {
    const calculatedAt = new Date().toISOString();
    const indicatorName: IndicatorType = 'WEIGHT_FOR_LENGTH';

    if (age.ageInDays >= 731) {
      return this.createErrorResult(
        indicatorName,
        sex,
        age,
        weightKg,
        'kg',
        'NOT_APPLICABLE',
        'Weight-for-length is only applicable for children under 2 years (<24 months / <731 days). For children 2–5 years, use Weight-for-height.'
      );
    }

    if (lengthCm < 45.0 || lengthCm > 110.0) {
      return this.createErrorResult(
        indicatorName,
        sex,
        age,
        weightKg,
        'kg',
        'INVALID_MEASUREMENT',
        `Length (${lengthCm} cm) is outside the supported WHO weight-for-length range [45.0 cm – 110.0 cm].`
      );
    }

    try {
      const dataset = WHODatasetRegistry.getDataset('0-5', indicatorName, sex);
      const roundedLength = Number((Math.round(lengthCm * 10) / 10).toFixed(1));
      const { lms, interpolated, keyUsed } = WHODatasetRegistry.findLMS(dataset, roundedLength);
      const zResult = ZScoreEngine.calculate(weightKg, lms, indicatorName);

      return {
        indicator: indicatorName,
        sex,
        ageInMonths: age.ageInMonths,
        ageInDays: age.ageInDays,
        measurement: weightKg,
        measurementUnit: 'kg',
        zScore: zResult.zScore,
        zScoreRaw: zResult.zScoreRaw,
        zScoreDisplayed: zResult.zScoreDisplayed,
        percentile: zResult.percentile,
        percentileRaw: zResult.percentileRaw,
        percentileDisplayed: zResult.percentileDisplayed,
        reference: 'WHO Child Growth Standards',
        referenceVersion: '2006',
        source: 'WHO',
        calculatedAt,
        status: 'VALID',
        metadata: {
          lms: { L: lms.L, M: lms.M, S: lms.S },
          keyUsed,
          interpolated,
          extremeAdjustmentApplied: zResult.extremeAdjustmentApplied,
          notes: `Evaluated against length ${roundedLength} cm. ${zResult.methodologyNotes}`,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.createErrorResult(indicatorName, sex, age, weightKg, 'kg', 'WHO_DATA_MISSING', msg);
    }
  }

  /**
   * Weight-for-height (24 to 60 completed months, 65.0 cm to 120.0 cm)
   */
  public static calculateWeightForHeight(
    sex: Sex,
    age: AgeCalculationResult,
    weightKg: number,
    heightCm: number
  ): IndicatorCalculationResult {
    const calculatedAt = new Date().toISOString();
    const indicatorName: IndicatorType = 'WEIGHT_FOR_HEIGHT';

    if (age.ageInDays < 731) {
      return this.createErrorResult(
        indicatorName,
        sex,
        age,
        weightKg,
        'kg',
        'NOT_APPLICABLE',
        'Weight-for-height is applicable for children aged 2–5 years (24 to 60 completed months). For children under 2 years, use Weight-for-length.'
      );
    }

    if (age.totalCompletedMonths > 60) {
      return this.createErrorResult(
        indicatorName,
        sex,
        age,
        weightKg,
        'kg',
        'NOT_APPLICABLE',
        'Weight-for-height is only defined up to 60 completed months (5 years) by WHO. For children 5–19 years, use BMI-for-age.'
      );
    }

    if (heightCm < 65.0 || heightCm > 120.0) {
      return this.createErrorResult(
        indicatorName,
        sex,
        age,
        weightKg,
        'kg',
        'INVALID_MEASUREMENT',
        `Height (${heightCm} cm) is outside the supported WHO weight-for-height range [65.0 cm – 120.0 cm].`
      );
    }

    try {
      const dataset = WHODatasetRegistry.getDataset('0-5', indicatorName, sex);
      const roundedHeight = Number((Math.round(heightCm * 10) / 10).toFixed(1));
      const { lms, interpolated, keyUsed } = WHODatasetRegistry.findLMS(dataset, roundedHeight);
      const zResult = ZScoreEngine.calculate(weightKg, lms, indicatorName);

      return {
        indicator: indicatorName,
        sex,
        ageInMonths: age.ageInMonths,
        ageInDays: age.ageInDays,
        measurement: weightKg,
        measurementUnit: 'kg',
        zScore: zResult.zScore,
        zScoreRaw: zResult.zScoreRaw,
        zScoreDisplayed: zResult.zScoreDisplayed,
        percentile: zResult.percentile,
        percentileRaw: zResult.percentileRaw,
        percentileDisplayed: zResult.percentileDisplayed,
        reference: 'WHO Child Growth Standards',
        referenceVersion: '2006',
        source: 'WHO',
        calculatedAt,
        status: 'VALID',
        metadata: {
          lms: { L: lms.L, M: lms.M, S: lms.S },
          keyUsed,
          interpolated,
          extremeAdjustmentApplied: zResult.extremeAdjustmentApplied,
          notes: `Evaluated against standing height ${roundedHeight} cm. ${zResult.methodologyNotes}`,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.createErrorResult(indicatorName, sex, age, weightKg, 'kg', 'WHO_DATA_MISSING', msg);
    }
  }

  /**
   * BMI-for-age
   * BMI = weightKg / ((heightCm / 100) ^ 2)
   */
  public static calculateBMIForAge(
    sex: Sex,
    age: AgeCalculationResult,
    weightKg: number,
    heightLengthCm: number,
    position: MeasurementPosition = 'auto'
  ): IndicatorCalculationResult {
    const calculatedAt = new Date().toISOString();
    const indicatorName: IndicatorType = 'BMI_FOR_AGE';

    if (weightKg <= 0 || heightLengthCm <= 0) {
      return this.createErrorResult(
        indicatorName,
        sex,
        age,
        0,
        'kg/m²',
        'INVALID_MEASUREMENT',
        'Both weight and height/length must be positive to calculate BMI.'
      );
    }

    const { normalizedCm, wasAdjusted, adjustmentNote } = this.normalizeLengthHeight(heightLengthCm, age, position);
    const heightMeters = normalizedCm / 100.0;
    const bmi = Number((weightKg / (heightMeters * heightMeters)).toFixed(2));

    const refSelection = WHOReferenceSelector.selectReference(sex, age);

    try {
      const dataset = WHODatasetRegistry.getDataset(refSelection.groupFolder, indicatorName, sex);
      const keyVal = refSelection.groupFolder === '0-5' ? age.ageInDays : age.ageInMonths;
      const { lms, interpolated, keyUsed } = WHODatasetRegistry.findLMS(dataset, keyVal);
      const zResult = ZScoreEngine.calculate(bmi, lms, indicatorName);

      return {
        indicator: indicatorName,
        sex,
        ageInMonths: age.ageInMonths,
        ageInDays: age.ageInDays,
        measurement: bmi,
        measurementUnit: 'kg/m²',
        zScore: zResult.zScore,
        zScoreRaw: zResult.zScoreRaw,
        zScoreDisplayed: zResult.zScoreDisplayed,
        percentile: zResult.percentile,
        percentileRaw: zResult.percentileRaw,
        percentileDisplayed: zResult.percentileDisplayed,
        reference: refSelection.reference,
        referenceVersion: refSelection.version,
        source: 'WHO',
        calculatedAt,
        status: 'VALID',
        metadata: {
          lms: { L: lms.L, M: lms.M, S: lms.S },
          keyUsed,
          interpolated,
          extremeAdjustmentApplied: zResult.extremeAdjustmentApplied,
          positionAdjustmentApplied: wasAdjusted
            ? {
                originalValue: heightLengthCm,
                adjustedValue: normalizedCm,
                rule: adjustmentNote || '',
              }
            : undefined,
          notes: `BMI = ${bmi} kg/m² (weight: ${weightKg} kg, height: ${normalizedCm} cm). ${zResult.methodologyNotes}`,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.createErrorResult(indicatorName, sex, age, bmi, 'kg/m²', 'WHO_DATA_MISSING', msg);
    }
  }

  /**
   * Head circumference-for-age
   * Supported only for 0–60 completed months (WHO Child Growth Standards).
   * For >60 months: returns "Not applicable."
   */
  public static calculateHeadCircumferenceForAge(
    sex: Sex,
    age: AgeCalculationResult,
    hcCm: number
  ): IndicatorCalculationResult {
    const calculatedAt = new Date().toISOString();
    const indicatorName: IndicatorType = 'HEAD_CIRCUMFERENCE_FOR_AGE';

    if (hcCm <= 0 || hcCm > 80) {
      return this.createErrorResult(
        indicatorName,
        sex,
        age,
        hcCm,
        'cm',
        'INVALID_MEASUREMENT',
        `Invalid head circumference: ${hcCm} cm.`
      );
    }

    if (age.totalCompletedMonths > 60 || age.ageInDays > 1856) {
      return {
        indicator: indicatorName,
        sex,
        ageInMonths: age.ageInMonths,
        ageInDays: age.ageInDays,
        measurement: hcCm,
        measurementUnit: 'cm',
        zScore: 0,
        zScoreRaw: 0,
        zScoreDisplayed: 'N/A',
        percentile: 0,
        percentileRaw: 0,
        percentileDisplayed: 'Not applicable',
        reference: 'WHO Child Growth Standards',
        referenceVersion: '2006',
        source: 'WHO',
        calculatedAt,
        status: 'NOT_APPLICABLE',
        errorMessage: 'Not applicable. WHO head circumference-for-age reference standards only cover 0–60 completed months.',
        metadata: {
          lms: { L: 0, M: 0, S: 0 },
          keyUsed: age.ageInDays,
          interpolated: false,
          extremeAdjustmentApplied: false,
          notes: 'WHO does not provide head circumference standards beyond 5 years of age.',
        },
      };
    }

    try {
      const dataset = WHODatasetRegistry.getDataset('0-5', indicatorName, sex);
      const { lms, interpolated, keyUsed } = WHODatasetRegistry.findLMS(dataset, age.ageInDays);
      const zResult = ZScoreEngine.calculate(hcCm, lms, indicatorName);

      return {
        indicator: indicatorName,
        sex,
        ageInMonths: age.ageInMonths,
        ageInDays: age.ageInDays,
        measurement: hcCm,
        measurementUnit: 'cm',
        zScore: zResult.zScore,
        zScoreRaw: zResult.zScoreRaw,
        zScoreDisplayed: zResult.zScoreDisplayed,
        percentile: zResult.percentile,
        percentileRaw: zResult.percentileRaw,
        percentileDisplayed: zResult.percentileDisplayed,
        reference: 'WHO Child Growth Standards',
        referenceVersion: '2006',
        source: 'WHO',
        calculatedAt,
        status: 'VALID',
        metadata: {
          lms: { L: lms.L, M: lms.M, S: lms.S },
          keyUsed,
          interpolated,
          extremeAdjustmentApplied: zResult.extremeAdjustmentApplied,
          notes: zResult.methodologyNotes,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return this.createErrorResult(indicatorName, sex, age, hcCm, 'cm', 'WHO_DATA_MISSING', msg);
    }
  }

  private static createErrorResult(
    indicator: IndicatorType,
    sex: Sex,
    age: AgeCalculationResult,
    measurement: number,
    unit: string,
    status: 'INVALID_MEASUREMENT' | 'WHO_DATA_MISSING' | 'AGE_OUT_OF_RANGE' | 'NOT_APPLICABLE',
    errorMessage: string
  ): IndicatorCalculationResult {
    return {
      indicator,
      sex,
      ageInMonths: age.ageInMonths,
      ageInDays: age.ageInDays,
      measurement,
      measurementUnit: unit,
      zScore: 0,
      zScoreRaw: 0,
      zScoreDisplayed: 'N/A',
      percentile: 0,
      percentileRaw: 0,
      percentileDisplayed: 'N/A',
      reference: age.totalCompletedMonths <= 60 ? 'WHO Child Growth Standards' : 'WHO 2007 Growth Reference',
      referenceVersion: age.totalCompletedMonths <= 60 ? '2006' : '2007',
      source: 'WHO',
      calculatedAt: new Date().toISOString(),
      status,
      errorMessage,
      metadata: {
        lms: { L: 0, M: 0, S: 0 },
        keyUsed: 0,
        interpolated: false,
        extremeAdjustmentApplied: false,
        notes: errorMessage,
      },
    };
  }
}

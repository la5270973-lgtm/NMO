/**
 * NMO | نمو — Child Growth Application
 * WHO Growth Engine (Primary Deterministic Entry Point)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 * 
 * CRITICAL RULE: This engine NEVER uses generative AI to calculate WHO values.
 * All computations are purely deterministic based on official WHO 2006 & 2007 tables.
 */

import {
  AgeCalculationResult,
  CalculationAuditRecord,
  FullGrowthAssessmentResult,
  GrowthAssessmentInput,
} from '../types/growth.ts';
import { AgeCalculator } from './AgeCalculator.ts';
import { IndicatorEngine } from './IndicatorEngine.ts';
import { WHOReferenceSelector } from './WHOReferenceSelector.ts';

export class WHOGrowthEngine {
  private static calculationCounter = 0;

  /**
   * Generates a unique, sequentially identifiable medical calculation audit ID.
   */
  private static generateCalculationId(): string {
    this.calculationCounter += 1;
    const timestamp = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 6);
    return `NMO-CALC-${timestamp}-${rand}-${this.calculationCounter}`;
  }

  /**
   * Evaluates complete child growth measurements against official WHO references.
   */
  public static assessGrowth(input: GrowthAssessmentInput): FullGrowthAssessmentResult {
    const calculationId = this.generateCalculationId();
    const errors: string[] = [];

    // 1. Validate Sex
    if (!input.sex || (input.sex !== 'male' && input.sex !== 'female')) {
      throw new Error('SEX_REQUIRED: Biological sex must be specified as "male" or "female".');
    }

    // 2. Validate Dates and Calculate Age
    let age: AgeCalculationResult;
    try {
      age = AgeCalculator.calculate(input.dateOfBirth, input.measurementDate || new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw err;
    }

    // 3. Check Overall WHO Age Range (0 to 19 years = 0 to 228 completed months)
    if (age.totalCompletedMonths > 228) {
      throw new Error(
        `AGE_OUT_OF_RANGE: Age (${age.totalCompletedMonths} months / ${age.completedYears} years) exceeds WHO reference maximum of 19.0 completed years (228 months).`
      );
    }

    // 4. Select Reference
    const refSelection = WHOReferenceSelector.selectReference(input.sex, age);
    const auditRecords: CalculationAuditRecord[] = [];

    // Helper to log audit trail
    const recordAudit = (res: ReturnType<typeof IndicatorEngine.calculateHeightForAge>) => {
      auditRecords.push({
        calculationId,
        childId: input.childId,
        measurementId: input.measurementId,
        indicator: res.indicator,
        sex: input.sex,
        age: {
          days: age.ageInDays,
          months: age.ageInMonths,
          completedYears: age.completedYears,
          completedMonths: age.totalCompletedMonths,
        },
        measurement: res.measurement,
        reference: res.reference,
        referenceVersion: res.referenceVersion,
        dataset: `${refSelection.groupFolder}_${res.indicator}_${input.sex}`,
        zScore: res.zScore,
        percentile: res.percentile,
        calculationMethod: res.metadata.extremeAdjustmentApplied
          ? 'WHO_RESTRICTED_SD'
          : refSelection.version === '2006'
          ? 'WHO_LMS_2006'
          : 'WHO_LMS_2007',
        timestamp: res.calculatedAt,
      });
    };

    const result: FullGrowthAssessmentResult = {
      calculationId,
      childId: input.childId,
      measurementId: input.measurementId,
      age,
      reference: refSelection.reference,
      referenceVersion: refSelection.version,
      auditRecords,
      status: 'VALID',
      errors,
    };

    // 5. Length / Height for Age
    if (input.heightLengthCm !== undefined && input.heightLengthCm !== null) {
      if (input.heightLengthCm <= 0) {
        errors.push(`INVALID_MEASUREMENT: Height/length must be positive (${input.heightLengthCm} cm given).`);
      } else {
        const heightRes = IndicatorEngine.calculateHeightForAge(
          input.sex,
          age,
          input.heightLengthCm,
          input.measurementPosition
        );
        result.heightLength = heightRes;
        recordAudit(heightRes);
      }
    }

    // 6. Weight for Age
    if (input.weightKg !== undefined && input.weightKg !== null) {
      if (input.weightKg <= 0) {
        errors.push(`INVALID_MEASUREMENT: Weight must be positive (${input.weightKg} kg given).`);
      } else {
        const weightRes = IndicatorEngine.calculateWeightForAge(input.sex, age, input.weightKg);
        result.weightForAge = weightRes;
        if (weightRes.status === 'VALID') {
          recordAudit(weightRes);
        }
      }
    }

    // 7. Weight for Length or Height (0-5 years)
    if (
      input.weightKg !== undefined &&
      input.weightKg > 0 &&
      input.heightLengthCm !== undefined &&
      input.heightLengthCm > 0 &&
      age.totalCompletedMonths <= 60
    ) {
      const isUnderTwo = age.ageInDays < 731;
      if (isUnderTwo) {
        const wflRes = IndicatorEngine.calculateWeightForLength(
          input.sex,
          age,
          input.weightKg,
          input.heightLengthCm
        );
        result.weightForLengthOrHeight = wflRes;
        if (wflRes.status === 'VALID') {
          recordAudit(wflRes);
        }
      } else {
        const wfhRes = IndicatorEngine.calculateWeightForHeight(
          input.sex,
          age,
          input.weightKg,
          input.heightLengthCm
        );
        result.weightForLengthOrHeight = wfhRes;
        if (wfhRes.status === 'VALID') {
          recordAudit(wfhRes);
        }
      }
    }

    // 8. BMI for Age
    if (
      input.weightKg !== undefined &&
      input.weightKg > 0 &&
      input.heightLengthCm !== undefined &&
      input.heightLengthCm > 0
    ) {
      const { normalizedCm } = IndicatorEngine.normalizeLengthHeight(
        input.heightLengthCm,
        age,
        input.measurementPosition
      );
      const heightM = normalizedCm / 100.0;
      result.calculatedBMI = Number((input.weightKg / (heightM * heightM)).toFixed(2));

      const bmiRes = IndicatorEngine.calculateBMIForAge(
        input.sex,
        age,
        input.weightKg,
        input.heightLengthCm,
        input.measurementPosition
      );
      result.bmiForAge = bmiRes;
      if (bmiRes.status === 'VALID') {
        recordAudit(bmiRes);
      }
    }

    // 9. Head Circumference for Age
    if (input.headCircumferenceCm !== undefined && input.headCircumferenceCm !== null) {
      if (input.headCircumferenceCm <= 0) {
        errors.push(`INVALID_MEASUREMENT: Head circumference must be positive (${input.headCircumferenceCm} cm given).`);
      } else {
        const hcRes = IndicatorEngine.calculateHeadCircumferenceForAge(
          input.sex,
          age,
          input.headCircumferenceCm
        );
        result.headCircumferenceForAge = hcRes;
        if (hcRes.status === 'VALID') {
          recordAudit(hcRes);
        }
      }
    }

    if (errors.length > 0) {
      result.status = 'INVALID_MEASUREMENT';
    }

    return result;
  }
}

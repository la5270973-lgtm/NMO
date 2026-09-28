/**
 * NMO | نمو — Child Growth Application
 * Phase 2: GrowthStatusEngine (Deterministic WHO Growth Status & Medical Rules)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 * Brand: نمو | NMO
 * 
 * CRITICAL MEDICAL RULES:
 * 1. NEVER use generative AI to determine growth status or medical classifications.
 * 2. Do NOT average Z-scores or percentiles.
 * 3. A higher percentile does NOT mean better growth; a lower percentile does NOT automatically mean abnormal.
 * 4. Each anthropometric indicator must be interpreted according to its own WHO reference and applicable age.
 * 5. Never display: "Your child is healthy", "Your child is normal", "No disease", "Perfect growth".
 * 6. Use strict non-diagnostic, parent-friendly and clinical terminology.
 */

import {
  AgeCalculationResult,
  FullGrowthAssessmentResult,
  IndicatorCalculationResult,
  IndicatorType,
  Sex,
  WHOReferenceName,
} from '../types/growth.ts';
import { Language } from '../i18n/types.ts';
import {
  GrowthStatusEngineInput,
  GrowthStatusEngineOutput,
  GrowthStatusLevel,
  IndicatorStatusEvaluation,
  LongitudinalTrendAnalysis,
  DoctorViewIndicator,
} from '../types/growthStatus.ts';

export interface IndicatorSummary {
  indicator: IndicatorType;
  measurementValue: number;
  unit: string;
  zScore: number;
  percentile: number;
  zScoreDisplayed: string;
  percentileDisplayed: string;
  technicalRangeCategory: 'severe_low' | 'low' | 'normal' | 'high' | 'severe_high' | 'not_applicable';
  status: string;
}

export interface TechnicalGrowthStatus {
  calculationId: string;
  timestamp: string;
  ageFormatted: string;
  referenceUsed: string;
  indicatorSummaries: IndicatorSummary[];
  hasLongitudinalData: boolean;
  longitudinalPointsCount: number;
  technicalNotes: string[];
}

export interface DashboardGrowthStatus {
  isReady: boolean;
  statusCategory: 'reassuring_growth' | 'within_expected' | 'needs_followup' | 'consider_review' | 'awaiting';
  statusLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  iconSymbol: string;
  subtitle: string;
  growthTrend: string;
  growthTrendCode: 'stable' | 'accelerating' | 'slowing' | 'awaiting';
  heightFormatted?: string;
  weightFormatted?: string;
  lastMeasurementDateFormatted?: string;
  fullOutput?: GrowthStatusEngineOutput;
}

export class GrowthStatusEngine {
  /**
   * Primary Deterministic Evaluation Entry Point (Section 1).
   * 
   * Input:
   * - child age
   * - sex
   * - applicable WHO indicators
   * - Z-scores
   * - percentiles
   * - historical measurements
   * - data sufficiency
   * 
   * Output:
   * {
   *   overallStatus,
   *   statusLevel,
   *   reasons,
   *   indicators,
   *   trend,
   *   parentExplanation,
   *   doctorRecommendation
   * }
   */
  public static evaluate(
    input: GrowthStatusEngineInput,
    preferredLanguage: Language = 'ar'
  ): GrowthStatusEngineOutput {
    const { age, sex, indicators, historicalAssessments = [], dataSufficiency } = input;

    // 1. DATA SUFFICIENCY CHECK (Section 9 & 13)
    const hasPrimaryMeasurements =
      Boolean(indicators.heightLength && indicators.heightLength.status === 'VALID') ||
      Boolean(indicators.weightForAge && indicators.weightForAge.status === 'VALID') ||
      Boolean(indicators.weightForLengthOrHeight && indicators.weightForLengthOrHeight.status === 'VALID') ||
      Boolean(indicators.bmiForAge && indicators.bmiForAge.status === 'VALID');

    const isDataSufficient =
      dataSufficiency
        ? (dataSufficiency.hasHeight || dataSufficiency.hasWeight) && dataSufficiency.hasAge
        : hasPrimaryMeasurements;

    if (!isDataSufficient) {
      return this.buildInsufficientDataOutput(preferredLanguage);
    }

    const completedMonths = age.completedMonths ?? Math.floor(age.ageInDays / 30.4375);
    const isUnder5Years = completedMonths <= 60; // 0–60 completed months
    const isBetween5and10 = completedMonths > 60 && completedMonths <= 120; // 5–10 years
    const isOver10Years = completedMonths > 120; // > 10 years

    const evaluatedIndicators: Partial<Record<IndicatorType, IndicatorStatusEvaluation>> = {};
    const applicableList: IndicatorStatusEvaluation[] = [];
    const reasonsEn: string[] = [];
    const reasonsAr: string[] = [];
    const doctorNotesEn: string[] = [];
    const doctorNotesAr: string[] = [];

    let hasSevereMedicalReview = false;
    let hasNeedsFollowUp = false;

    // 2. EVALUATE WEIGHT-FOR-LENGTH / WEIGHT-FOR-HEIGHT (Section 4)
    // Applicable only for children under 5 years (0–60 completed months)
    const wflOrWfh = indicators.weightForLengthOrHeight;
    if (wflOrWfh && wflOrWfh.status === 'VALID') {
      if (isUnder5Years) {
        const z = wflOrWfh.zScore;
        let classificationCode = 'WITHIN_EXPECTED';
        let classificationEn = 'Within expected WHO reference range';
        let classificationAr = 'ضمن نطاق مرجع منظمة الصحة العالمية المتوقع';
        let reqReview = false;
        let reqFollowUp = false;
        let parentExpEn = 'Weight-for-length/height is within the expected WHO reference range.';
        let parentExpAr = 'الوزن بالنسبة للطول/الارتفاع يقع ضمن نطاق مرجع منظمة الصحة العالمية المتوقع.';

        if (z > 3.0) {
          classificationCode = 'OBESITY';
          classificationEn = 'Obesity range (> +3 SD)';
          classificationAr = 'نطاق السمنة (> +3 انحرافات معيارية)';
          reqReview = true;
          hasSevereMedicalReview = true;
          parentExpEn = 'Weight-for-length/height is substantially above the WHO reference range (obesity range).';
          parentExpAr = 'الوزن بالنسبة للطول/الارتفاع أعلى بشكل ملحوظ من نطاق مرجع منظمة الصحة العالمية (نطاق السمنة).';
          reasonsEn.push('Weight-for-length/height is substantially above reference range (> +3 SD).');
          reasonsAr.push('الوزن بالنسبة للطول/الارتفاع يقع أعلى من +3 انحرافات معيارية (نطاق السمنة).');
        } else if (z > 2.0) {
          classificationCode = 'OVERWEIGHT';
          classificationEn = 'Overweight range (> +2 to +3 SD)';
          classificationAr = 'نطاق زيادة الوزن (> +2 إلى +3 انحرافات معيارية)';
          reqFollowUp = true;
          hasNeedsFollowUp = true;
          parentExpEn = 'Weight-for-length/height is above the WHO reference range (overweight range).';
          parentExpAr = 'الوزن بالنسبة للطول/الارتفاع أعلى من نطاق مرجع منظمة الصحة العالمية (نطاق زيادة الوزن).';
          reasonsEn.push('Weight-for-length/height is in overweight range (> +2 SD).');
          reasonsAr.push('الوزن بالنسبة للطول/الارتفاع يقع في نطاق زيادة الوزن (> +2 انحراف معياري).');
        } else if (z < -3.0) {
          classificationCode = 'SEVERE_WASTING';
          classificationEn = 'Severe wasting range (< -3 SD)';
          classificationAr = 'نطاق الهزال الشديد (< -3 انحرافات معيارية)';
          reqReview = true;
          hasSevereMedicalReview = true;
          parentExpEn = 'Weight-for-length/height is substantially below the WHO reference range (severe wasting range requiring medical assessment).';
          parentExpAr = 'الوزن بالنسبة للطول/الارتفاع أقل بشكل ملحوظ من نطاق مرجع منظمة الصحة العالمية (هزال شديد يتطلب تقييماً طبياً).';
          reasonsEn.push('Weight-for-length/height is severely below reference range (< -3 SD, severe wasting range).');
          reasonsAr.push('الوزن بالنسبة للطول/الارتفاع يقع أقل من -3 انحرافات معيارية (نطاق الهزال الشديد).');
        } else if (z < -2.0) {
          classificationCode = 'WASTING_FOLLOW_UP';
          classificationEn = 'Wasting range requiring follow-up (< -2 to -3 SD)';
          classificationAr = 'نطاق الهزال الذي يتطلب متابعة (< -2 إلى -3 انحرافات معيارية)';
          reqFollowUp = true;
          hasNeedsFollowUp = true;
          parentExpEn = 'Weight-for-length/height is below the WHO reference range (wasting range requiring follow-up).';
          parentExpAr = 'الوزن بالنسبة للطول/الارتفاع أقل من نطاق مرجع منظمة الصحة العالمية (نطاق هزال يتطلب متابعة).';
          reasonsEn.push('Weight-for-length/height is below reference range (< -2 SD, wasting follow-up).');
          reasonsAr.push('الوزن بالنسبة للطول/الارتفاع يقع في نطاق الهزال الذي يتطلب متابعة (< -2 انحراف معياري).');
        }

        const evalItem: IndicatorStatusEvaluation = {
          indicator: wflOrWfh.indicator,
          indicatorNameEn: 'Weight-for-length/height',
          indicatorNameAr: 'الوزن بالنسبة للطول',
          isApplicable: true,
          measurementValue: wflOrWfh.measurement,
          measurementUnit: wflOrWfh.measurementUnit,
          zScore: wflOrWfh.zScore,
          zScoreDisplayed: wflOrWfh.zScoreDisplayed,
          percentile: wflOrWfh.percentile,
          percentileDisplayed: wflOrWfh.percentileDisplayed,
          reference: wflOrWfh.reference,
          referenceVersion: wflOrWfh.referenceVersion,
          datasetName: wflOrWfh.source,
          calculationMethod: 'WHO LMS',
          classificationCode,
          classificationEn,
          classificationAr,
          parentExplanationEn: parentExpEn,
          parentExplanationAr: parentExpAr,
          doctorNoteEn: `WFL/WFH Z=${wflOrWfh.zScoreDisplayed} (${wflOrWfh.percentileDisplayed} %tile) under WHO 2006 Standards.`,
          doctorNoteAr: `الوزن بالنسبة للطول Z=${wflOrWfh.zScoreDisplayed} (المئين ${wflOrWfh.percentile.toFixed(1)}) وفق معايير نمو الأطفال لمنظمة الصحة العالمية (WHO).`,
          requiresFollowUp: reqFollowUp,
          requiresMedicalReview: reqReview,
          lmsParameters: wflOrWfh.metadata?.lms,
        };

        evaluatedIndicators[wflOrWfh.indicator] = evalItem;
        applicableList.push(evalItem);
      }
    }

    // 3. EVALUATE HEIGHT/LENGTH-FOR-AGE (Section 4 & 6)
    // Applicable for both 0–5 and 5–19 years
    const hfa = indicators.heightLength;
    if (hfa && hfa.status === 'VALID') {
      const z = hfa.zScore;
      let classificationCode = 'NO_STUNTING';
      let classificationEn = 'Height-for-age is within the WHO reference range.';
      let classificationAr = 'الطول بالنسبة للعمر يقع ضمن نطاق مرجع منظمة الصحة العالمية.';
      let reqReview = false;
      let reqFollowUp = false;
      let parentExpEn = 'Height-for-age is within the WHO reference range.';
      let parentExpAr = 'الطول بالنسبة للعمر يقع ضمن نطاق مرجع منظمة الصحة العالمية.';

      if (z < -3.0) {
        classificationCode = 'SEVERE_STUNTING';
        classificationEn = 'Severe stunting range (< -3 SD)';
        classificationAr = 'نطاق قصر القامة الشديد (< -3 انحرافات معيارية)';
        reqReview = true;
        hasSevereMedicalReview = true;
        parentExpEn = 'Height-for-age is substantially below the WHO reference range and should be medically reviewed.';
        parentExpAr = 'الطول بالنسبة للعمر أقل بشكل ملحوظ من نطاق مرجع منظمة الصحة العالمية ويُنصح بمراجعته طبياً.';
        reasonsEn.push('Height-for-age is substantially below the WHO reference range (< -3 SD).');
        reasonsAr.push('الطول بالنسبة للعمر أقل بشكل ملحوظ من مرجع منظمة الصحة العالمية (< -3 انحرافات معيارية).');
      } else if (z < -2.0) {
        classificationCode = 'MODERATE_STUNTING';
        classificationEn = 'Moderate stunting range (< -2 to -3 SD)';
        classificationAr = 'نطاق قصر القامة المتوسط (< -2 إلى -3 انحرافات معيارية)';
        reqFollowUp = true;
        hasNeedsFollowUp = true;
        parentExpEn = 'Height-for-age is below the WHO reference range and should be followed.';
        parentExpAr = 'الطول بالنسبة للعمر أقل من نطاق مرجع منظمة الصحة العالمية ويحتاج إلى متابعة.';
        reasonsEn.push('Height-for-age is below the WHO reference range (< -2 SD).');
        reasonsAr.push('الطول بالنسبة للعمر أقل من نطاق مرجع منظمة الصحة العالمية (< -2 انحراف معياري).');
      } else if (z > 3.0) {
        classificationCode = 'VERY_TALL';
        classificationEn = 'Height-for-age is substantially above the reference range (> +3 SD).';
        classificationAr = 'الطول بالنسبة للعمر أعلى بشكل ملحوظ من النطاق المعتاد (> +3 انحرافات معيارية).';
        reqReview = true;
        hasSevereMedicalReview = true;
        parentExpEn = 'Height-for-age is substantially above the WHO reference range and should be medically reviewed.';
        parentExpAr = 'الطول بالنسبة للعمر أعلى بشكل ملحوظ من نطاق مرجع منظمة الصحة العالمية ويُنصح بمراجعته طبياً.';
        reasonsEn.push('Height-for-age is substantially above reference range (> +3 SD).');
        reasonsAr.push('الطول بالنسبة للعمر يقع أعلى من +3 انحرافات معيارية.');
      }

      const evalItem: IndicatorStatusEvaluation = {
        indicator: hfa.indicator,
        indicatorNameEn: 'Height/length-for-age',
        indicatorNameAr: 'الطول بالنسبة للعمر',
        isApplicable: true,
        measurementValue: hfa.measurement,
        measurementUnit: hfa.measurementUnit,
        zScore: hfa.zScore,
        zScoreDisplayed: hfa.zScoreDisplayed,
        percentile: hfa.percentile,
        percentileDisplayed: hfa.percentileDisplayed,
        reference: hfa.reference,
        referenceVersion: hfa.referenceVersion,
        datasetName: hfa.source,
        calculationMethod: 'WHO LMS',
        classificationCode,
        classificationEn,
        classificationAr,
        parentExplanationEn: parentExpEn,
        parentExplanationAr: parentExpAr,
        doctorNoteEn: `Height-for-age Z=${hfa.zScoreDisplayed} (${hfa.percentileDisplayed} %tile) under ${hfa.reference}. Non-diagnostic anthropometric classification.`,
        doctorNoteAr: `الطول بالنسبة للعمر Z=${hfa.zScoreDisplayed} (المئين ${hfa.percentile.toFixed(1)}) وفق معايير نمو الأطفال لمنظمة الصحة العالمية (WHO). تصنيف قياسات جسمية دون تشخيص مرضي.`,
        requiresFollowUp: reqFollowUp,
        requiresMedicalReview: reqReview,
        lmsParameters: hfa.metadata?.lms,
      };

      evaluatedIndicators[hfa.indicator] = evalItem;
      applicableList.push(evalItem);
    }

    // 4. EVALUATE BMI-FOR-AGE (Section 4 & 5)
    const bmiInd = indicators.bmiForAge;
    if (bmiInd && bmiInd.status === 'VALID') {
      const z = bmiInd.zScore;
      let classificationCode = 'WITHIN_EXPECTED';
      let classificationEn = 'Within expected WHO reference range';
      let classificationAr = 'ضمن نطاق مرجع منظمة الصحة العالمية المتوقع';
      let reqReview = false;
      let reqFollowUp = false;
      let parentExpEn = 'BMI-for-age is within the expected WHO reference range.';
      let parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر يقع ضمن نطاق مرجع منظمة الصحة العالمية المتوقع.';

      if (isUnder5Years) {
        // Under 5 years (WHO 2006 Standards)
        if (z > 3.0) {
          classificationCode = 'OBESITY';
          classificationEn = 'Obesity range (> +3 SD)';
          classificationAr = 'نطاق السمنة (> +3 انحرافات معيارية)';
          reqReview = true;
          hasSevereMedicalReview = true;
          parentExpEn = 'BMI-for-age is substantially above the reference range (obesity range).';
          parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر أعلى بشكل ملحوظ من النطاق المعتاد (نطاق السمنة).';
          reasonsEn.push('BMI-for-age is substantially above reference range (> +3 SD).');
          reasonsAr.push('مؤشر كتلة الجسم بالنسبة للعمر يقع أعلى من +3 انحرافات معيارية.');
        } else if (z > 2.0) {
          classificationCode = 'OVERWEIGHT';
          classificationEn = 'Overweight range (> +2 to +3 SD)';
          classificationAr = 'نطاق زيادة الوزن (> +2 إلى +3 انحرافات معيارية)';
          reqFollowUp = true;
          hasNeedsFollowUp = true;
          parentExpEn = 'BMI-for-age is above the reference range (overweight range).';
          parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر أعلى من النطاق المعتاد (نطاق زيادة الوزن).';
          reasonsEn.push('BMI-for-age is in overweight range (> +2 SD).');
          reasonsAr.push('مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق زيادة الوزن (> +2 انحراف معياري).');
        } else if (z < -3.0) {
          classificationCode = 'SEVERE_THINNESS';
          classificationEn = 'Severe thinness range (< -3 SD)';
          classificationAr = 'نطاق النحافة الشديدة (< -3 انحرافات معيارية)';
          reqReview = true;
          hasSevereMedicalReview = true;
          parentExpEn = 'BMI-for-age is substantially below the reference range (severe thinness range).';
          parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر أقل بشكل ملحوظ من النطاق المعتاد (نطاق النحافة الشديدة).';
          reasonsEn.push('BMI-for-age is severely below reference range (< -3 SD).');
          reasonsAr.push('مؤشر كتلة الجسم بالنسبة للعمر يقع أقل من -3 انحرافات معيارية.');
        } else if (z < -2.0) {
          classificationCode = 'THINNESS';
          classificationEn = 'Thinness range (< -2 to -3 SD)';
          classificationAr = 'نطاق النحافة (< -2 إلى -3 انحرافات معيارية)';
          reqFollowUp = true;
          hasNeedsFollowUp = true;
          parentExpEn = 'BMI-for-age is below the reference range (thinness range).';
          parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر أقل من النطاق المعتاد (نطاق النحافة).';
          reasonsEn.push('BMI-for-age is in thinness range (< -2 SD).');
          reasonsAr.push('مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق النحافة (< -2 انحراف معياري).');
        }
      } else {
        // Age 5–19 years (WHO 2007 Reference) — Section 5
        if (z > 2.0) {
          classificationCode = 'OBESITY';
          classificationEn = 'Obesity range (> +2 SD)';
          classificationAr = 'نطاق السمنة (> +2 انحراف معياري)';
          reqReview = z > 3.0;
          reqFollowUp = true;
          if (z > 3.0) hasSevereMedicalReview = true;
          else hasNeedsFollowUp = true;
          parentExpEn = 'BMI-for-age is in the obesity range according to WHO 2007 reference.';
          parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق السمنة وفق مرجع منظمة الصحة العالمية 2007.';
          reasonsEn.push('BMI-for-age is in obesity range (> +2 SD) for 5-19 years.');
          reasonsAr.push('مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق السمنة (> +2 انحراف معياري).');
        } else if (z > 1.0) {
          classificationCode = 'OVERWEIGHT';
          classificationEn = 'Overweight range (> +1 to +2 SD)';
          classificationAr = 'نطاق زيادة الوزن (> +1 إلى +2 انحراف معياري)';
          reqFollowUp = true;
          hasNeedsFollowUp = true;
          parentExpEn = 'BMI-for-age is in the overweight range according to WHO 2007 reference.';
          parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق زيادة الوزن وفق مرجع منظمة الصحة العالمية 2007.';
          reasonsEn.push('BMI-for-age is in overweight range (> +1 SD) for 5-19 years.');
          reasonsAr.push('مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق زيادة الوزن (> +1 انحراف معياري).');
        } else if (z < -3.0) {
          classificationCode = 'SEVERE_THINNESS';
          classificationEn = 'Severe thinness range (< -3 SD)';
          classificationAr = 'نطاق النحافة الشديدة (< -3 انحرافات معيارية)';
          reqReview = true;
          hasSevereMedicalReview = true;
          parentExpEn = 'BMI-for-age is in the severe thinness range according to WHO 2007 reference and requires medical assessment.';
          parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق النحافة الشديدة ويتطلب تقييماً طبياً.';
          reasonsEn.push('BMI-for-age is in severe thinness range (< -3 SD).');
          reasonsAr.push('مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق النحافة الشديدة (< -3 انحرافات معيارية).');
        } else if (z < -2.0) {
          classificationCode = 'THINNESS';
          classificationEn = 'Thinness range (< -2 to -3 SD)';
          classificationAr = 'نطاق النحافة (< -2 إلى -3 انحرافات معيارية)';
          reqFollowUp = true;
          hasNeedsFollowUp = true;
          parentExpEn = 'BMI-for-age is in the thinness range according to WHO 2007 reference.';
          parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق النحافة وفق مرجع منظمة الصحة العالمية 2007.';
          reasonsEn.push('BMI-for-age is in thinness range (< -2 SD).');
          reasonsAr.push('مؤشر كتلة الجسم بالنسبة للعمر يقع في نطاق النحافة (< -2 انحراف معياري).');
        } else {
          // >= -2 and <= +1
          parentExpEn = 'BMI-for-age is within the expected WHO reference range (-2 to +1 SD).';
          parentExpAr = 'مؤشر كتلة الجسم بالنسبة للعمر يقع ضمن نطاق مرجع منظمة الصحة العالمية المتوقع (-2 إلى +1 انحراف معياري).';
        }
      }

      const evalItem: IndicatorStatusEvaluation = {
        indicator: bmiInd.indicator,
        indicatorNameEn: 'BMI-for-age',
        indicatorNameAr: 'مؤشر كتلة الجسم بالنسبة للعمر',
        isApplicable: true,
        measurementValue: bmiInd.measurement,
        measurementUnit: bmiInd.measurementUnit,
        zScore: bmiInd.zScore,
        zScoreDisplayed: bmiInd.zScoreDisplayed,
        percentile: bmiInd.percentile,
        percentileDisplayed: bmiInd.percentileDisplayed,
        reference: bmiInd.reference,
        referenceVersion: bmiInd.referenceVersion,
        datasetName: bmiInd.source,
        calculationMethod: 'WHO LMS',
        classificationCode,
        classificationEn,
        classificationAr,
        parentExplanationEn: parentExpEn,
        parentExplanationAr: parentExpAr,
        doctorNoteEn: `BMI-for-age Z=${bmiInd.zScoreDisplayed} (${bmiInd.percentileDisplayed} %tile) under ${bmiInd.reference}. Never use adult BMI cutoffs.`,
        doctorNoteAr: `مؤشر كتلة الجسم بالنسبة للعمر Z=${bmiInd.zScoreDisplayed} (المئين ${bmiInd.percentile.toFixed(1)}) وفق معايير نمو الأطفال لمنظمة الصحة العالمية (WHO). لا يُستخدم تصنيف البالغين.`,
        requiresFollowUp: reqFollowUp,
        requiresMedicalReview: reqReview,
        lmsParameters: bmiInd.metadata?.lms,
      };

      evaluatedIndicators[bmiInd.indicator] = evalItem;
      applicableList.push(evalItem);
    }

    // 5. EVALUATE WEIGHT-FOR-AGE (Section 7)
    // Valid for 0–5 years and 5–10 years (<= 120 completed months).
    // MUST NOT BE USED AFTER AGE 10 (> 120 completed months)!
    const wfa = indicators.weightForAge;
    if (wfa && wfa.status === 'VALID' && !isOver10Years) {
      const z = wfa.zScore;
      let classificationCode = 'WITHIN_EXPECTED';
      let classificationEn = 'Weight-for-age is within the WHO reference range.';
      let classificationAr = 'الوزن بالنسبة للعمر يقع ضمن نطاق مرجع منظمة الصحة العالمية.';
      let reqReview = false;
      let reqFollowUp = false;
      let parentExpEn = 'Weight-for-age is within the WHO reference range.';
      let parentExpAr = 'الوزن بالنسبة للعمر يقع ضمن نطاق مرجع منظمة الصحة العالمية.';

      if (z < -3.0) {
        classificationCode = 'SEVERELY_UNDERWEIGHT';
        classificationEn = 'Weight-for-age is substantially below the reference range (< -3 SD).';
        classificationAr = 'الوزن بالنسبة للعمر أقل بشكل ملحوظ من النطاق المعتاد (< -3 انحرافات معيارية).';
        reqReview = true;
        hasSevereMedicalReview = true;
        parentExpEn = 'Weight-for-age is substantially below the WHO reference range and should be medically reviewed.';
        parentExpAr = 'الوزن بالنسبة للعمر أقل بشكل ملحوظ من نطاق مرجع منظمة الصحة العالمية ويُنصح بمراجعته طبياً.';
        reasonsEn.push('Weight-for-age is substantially below reference range (< -3 SD).');
        reasonsAr.push('الوزن بالنسبة للعمر يقع أقل من -3 انحرافات معيارية.');
      } else if (z < -2.0) {
        classificationCode = 'UNDERWEIGHT_FOLLOW_UP';
        classificationEn = 'Weight-for-age is below the WHO reference range (< -2 SD).';
        classificationAr = 'الوزن بالنسبة للعمر أقل من نطاق مرجع منظمة الصحة العالمية (< -2 انحراف معياري).';
        reqFollowUp = true;
        hasNeedsFollowUp = true;
        parentExpEn = 'Weight-for-age is below the WHO reference range and should be followed.';
        parentExpAr = 'الوزن بالنسبة للعمر أقل من نطاق مرجع منظمة الصحة العالمية ويحتاج إلى متابعة.';
        reasonsEn.push('Weight-for-age is below reference range (< -2 SD).');
        reasonsAr.push('الوزن بالنسبة للعمر يقع أقل من -2 انحراف معياري.');
      } else if (z > 3.0) {
        classificationCode = 'HIGH_WEIGHT_FOR_AGE';
        classificationEn = 'Weight-for-age is substantially above the reference range (> +3 SD).';
        classificationAr = 'الوزن بالنسبة للعمر أعلى بشكل ملحوظ من النطاق المعتاد (> +3 انحرافات معيارية).';
        reqFollowUp = true;
        hasNeedsFollowUp = true;
        parentExpEn = 'Weight-for-age is above the reference range. Check weight-for-height/BMI.';
        parentExpAr = 'الوزن بالنسبة للعمر أعلى من النطاق المعتاد. يتم تقييم الوزن بالنسبة للطول/BMI.';
        reasonsEn.push('Weight-for-age is substantially above reference range (> +3 SD).');
        reasonsAr.push('الوزن بالنسبة للعمر أعلى من +3 انحرافات معيارية.');
      }

      const evalItem: IndicatorStatusEvaluation = {
        indicator: wfa.indicator,
        indicatorNameEn: 'Weight-for-age',
        indicatorNameAr: 'الوزن بالنسبة للعمر',
        isApplicable: true,
        measurementValue: wfa.measurement,
        measurementUnit: wfa.measurementUnit,
        zScore: wfa.zScore,
        zScoreDisplayed: wfa.zScoreDisplayed,
        percentile: wfa.percentile,
        percentileDisplayed: wfa.percentileDisplayed,
        reference: wfa.reference,
        referenceVersion: wfa.referenceVersion,
        datasetName: wfa.source,
        calculationMethod: 'WHO LMS',
        classificationCode,
        classificationEn,
        classificationAr,
        parentExplanationEn: parentExpEn,
        parentExplanationAr: parentExpAr,
        doctorNoteEn: `Weight-for-age Z=${wfa.zScoreDisplayed} (${wfa.percentileDisplayed} %tile). Not a stand-alone diagnostic indicator.`,
        doctorNoteAr: `الوزن بالنسبة للعمر Z=${wfa.zScoreDisplayed} (المئين ${wfa.percentile.toFixed(1)}). لا يُعد مؤشراً تشخيصياً منفرداً.`,
        requiresFollowUp: reqFollowUp,
        requiresMedicalReview: reqReview,
        lmsParameters: wfa.metadata?.lms,
      };

      evaluatedIndicators[wfa.indicator] = evalItem;
      applicableList.push(evalItem);
    }

    // 6. EVALUATE HEAD CIRCUMFERENCE-FOR-AGE (Section 8)
    // Applicable only for 0–60 completed months (0–5 years)
    const hc = indicators.headCircumferenceForAge;
    if (hc && hc.status === 'VALID' && isUnder5Years) {
      const z = hc.zScore;
      let classificationCode = 'WITHIN_EXPECTED';
      let classificationEn = 'Head circumference-for-age is within the WHO reference range.';
      let classificationAr = 'محيط الرأس بالنسبة للعمر يقع ضمن نطاق مرجع منظمة الصحة العالمية.';
      let reqReview = false;
      let reqFollowUp = false;
      let parentExpEn = 'Head circumference-for-age is within the WHO reference range.';
      let parentExpAr = 'محيط الرأس بالنسبة للعمر يقع ضمن نطاق مرجع منظمة الصحة العالمية.';

      if (Math.abs(z) > 3.0) {
        classificationCode = 'REQUIRES_MEDICAL_REVIEW';
        classificationEn = 'Head circumference measurement requires medical review (> 3 SD).';
        classificationAr = 'قياس محيط الرأس يتطلب مراجعة طبية (أكثر من 3 انحرافات معيارية).';
        reqReview = true;
        hasSevereMedicalReview = true;
        parentExpEn = 'Head circumference measurement requires medical review.';
        parentExpAr = 'قياس محيط الرأس يتطلب مراجعة طبية.';
        reasonsEn.push('Head circumference measurement requires medical review (|Z| > 3 SD).');
        reasonsAr.push('قياس محيط الرأس يتطلب مراجعة طبية (يبتعد بأكثر من 3 انحرافات معيارية).');
      } else if (Math.abs(z) > 2.0) {
        classificationCode = 'OUTSIDE_TYPICAL_RANGE';
        classificationEn = 'Head circumference measurement is outside the typical WHO reference range and should be followed.';
        classificationAr = 'قياس محيط الرأس يقع خارج النطاق المعتاد ويحتاج إلى متابعة.';
        reqFollowUp = true;
        hasNeedsFollowUp = true;
        parentExpEn = 'Head circumference measurement is outside the typical reference range and should be followed.';
        parentExpAr = 'قياس محيط الرأس يقع خارج النطاق المعتاد ويحتاج إلى متابعة.';
        reasonsEn.push('Head circumference is outside typical reference range (|Z| > 2 SD).');
        reasonsAr.push('قياس محيط الرأس يقع خارج النطاق المعتاد (|Z| > 2 انحراف معياري).');
      }

      const evalItem: IndicatorStatusEvaluation = {
        indicator: hc.indicator,
        indicatorNameEn: 'Head circumference-for-age',
        indicatorNameAr: 'محيط الرأس بالنسبة للعمر',
        isApplicable: true,
        measurementValue: hc.measurement,
        measurementUnit: hc.measurementUnit,
        zScore: hc.zScore,
        zScoreDisplayed: hc.zScoreDisplayed,
        percentile: hc.percentile,
        percentileDisplayed: hc.percentileDisplayed,
        reference: hc.reference,
        referenceVersion: hc.referenceVersion,
        datasetName: hc.source,
        calculationMethod: 'WHO LMS',
        classificationCode,
        classificationEn,
        classificationAr,
        parentExplanationEn: parentExpEn,
        parentExplanationAr: parentExpAr,
        doctorNoteEn: `HC-for-age Z=${hc.zScoreDisplayed} (${hc.percentileDisplayed} %tile). Do not diagnose micro/macrocephaly solely based on app label.`,
        doctorNoteAr: `محيط الرأس بالنسبة للعمر Z=${hc.zScoreDisplayed} (المئين ${hc.percentile.toFixed(1)}). لا يُشخص كبر أو صغر الرأس دون فحص سريري.`,
        requiresFollowUp: reqFollowUp,
        requiresMedicalReview: reqReview,
        lmsParameters: hc.metadata?.lms,
      };

      evaluatedIndicators[hc.indicator] = evalItem;
      applicableList.push(evalItem);
    }

    // 7. LONGITUDINAL TRAJECTORY ANALYSIS (Section 12)
    const trendAnalysis = this.analyzeLongitudinalTrend(indicators, historicalAssessments, age);
    if (trendAnalysis.requiresFollowUp) {
      hasNeedsFollowUp = true;
      reasonsEn.push(trendAnalysis.explanationEn);
      reasonsAr.push(trendAnalysis.explanationAr);
    }

    // 8. OVERALL STATUS DETERMINATION (Priority Logic — Section 9, 10, 11)
    let statusLevel: GrowthStatusLevel = 'WITHIN_EXPECTED_RANGE';
    let overallStatusEn = 'Within Expected Range';
    let overallStatusAr = 'ضمن المتوقع';
    let badgeBg = 'bg-emerald-500/10';
    let badgeText = 'text-emerald-400';
    let badgeBorder = 'border-emerald-500/25';
    let iconSymbol = '🟢';
    let dotColor = 'bg-emerald-400';
    let parentExpEn = 'Current growth measurements are within the expected range of the selected growth reference.';
    let parentExpAr = 'قياسات النمو الحالية تقع ضمن النطاق المتوقع وفق مرجع النمو المستخدم.';
    let docRecEn = 'Measurements lie within expected WHO reference parameters. Continue routine pediatric monitoring.';
    let docRecAr = 'القياسات تقع ضمن النطاقات المعتادة لمرجع منظمة الصحة العالمية. يوصى بمواصلة المتابعة الدورية.';

    // Priority 2: Potentially serious anthropometric finding
    if (hasSevereMedicalReview) {
      statusLevel = 'CONSIDER_MEDICAL_REVIEW';
      overallStatusEn = 'Consider Medical Review';
      overallStatusAr = 'يُنصح بمراجعة الطبيب';
      badgeBg = 'bg-orange-500/10';
      badgeText = 'text-orange-400';
      badgeBorder = 'border-orange-500/25';
      iconSymbol = '🟠';
      dotColor = 'bg-orange-400';
      parentExpEn =
        'Certain growth measurements lie outside the usual WHO reference range. A medical review with a healthcare professional is recommended for comprehensive clinical evaluation.';
      parentExpAr =
        'بعض قياسات النمو تقع خارج النطاق المعتاد لمرجع منظمة الصحة العالمية. يُنصح بمراجعة الطبيب لإجراء تقييم سريري شامل.';
      docRecEn =
        'Anthropometric indicators indicate extreme deviations (> 3 SD from WHO median). Clinical evaluation and history assessment recommended.';
      docRecAr =
        'تُشير المؤشرات القياسية إلى انحرافات حادة تتجاوز 3 انحرافات معيارية عن وسيط منظمة الصحة العالمية. يُوصى بالتقييم السريري الشامل.';
    }
    // Priority 3: Clear indicator requiring follow-up
    else if (hasNeedsFollowUp) {
      statusLevel = 'NEEDS_FOLLOW_UP';
      overallStatusEn = 'Needs Follow-up';
      overallStatusAr = 'يحتاج متابعة';
      badgeBg = 'bg-yellow-500/10';
      badgeText = 'text-yellow-400';
      badgeBorder = 'border-yellow-500/25';
      iconSymbol = '🟡';
      dotColor = 'bg-yellow-400';
      parentExpEn =
        'Current measurements or growth trajectory indicate the need for routine follow-up to observe developmental progress.';
      parentExpAr =
        'القياسات الحالية أو مسار النمو يتطلبان متابعة دورية لمراقبة التطور والنمو المتزن.';
      docRecEn =
        'One or more parameters fall in borderline or follow-up intervals (-2 to -3 SD, > +2 SD, or longitudinal shift). Schedule follow-up measurement.';
      docRecAr =
        'يقع مؤشر أو أكثر ضمن نطاقات المتابعة (-2 إلى -3 SD، أو > +2 SD، أو تغير في المسار الطولي). يُوصى بتسجيل قياسات دورية.';
    }
    // Priority 4 & 5: Measurements within expected reference ranges
    else {
      // Section 11: Use REASSURING_GROWTH ONLY when:
      // - sufficient data are available
      // - applicable indicators are within expected ranges
      // - no concerning longitudinal change is detected
      // - there is no indicator requiring medical review
      // And has multiple measurements confirming stable trajectory!
      if (trendAnalysis.hasLongitudinalData && trendAnalysis.trendCode === 'stable') {
        statusLevel = 'REASSURING_GROWTH';
        overallStatusEn = 'Reassuring Growth';
        overallStatusAr = 'نمو مطمئن';
        badgeBg = 'bg-emerald-500/10';
        badgeText = 'text-emerald-400';
        badgeBorder = 'border-emerald-500/25';
        iconSymbol = '🟢';
        dotColor = 'bg-emerald-400';
        parentExpEn =
          'Current growth measurements are within the expected range of the selected growth reference.';
        parentExpAr =
          'قياسات النمو الحالية تقع ضمن النطاق المتوقع وفق مرجع النمو المستخدم.';
        docRecEn =
          'Anthropometric indicators and longitudinal trajectory follow consistent median percentiles under WHO standards.';
        docRecAr =
          'المؤشرات القياسية والمسار الطولي متسقان مع المنحنى الوسيط لمنظمة الصحة العالمية بنمط متوازن.';
      } else {
        // Section 11: Use WITHIN_EXPECTED_RANGE when current measurements are within the applicable WHO reference
        // but there is not enough longitudinal information to confidently describe a stable trajectory.
        statusLevel = 'WITHIN_EXPECTED_RANGE';
        overallStatusEn = 'Within Expected Range';
        overallStatusAr = 'ضمن المتوقع';
        badgeBg = 'bg-emerald-500/10';
        badgeText = 'text-emerald-400';
        badgeBorder = 'border-emerald-500/25';
        iconSymbol = '🟢';
        dotColor = 'bg-emerald-400';
        parentExpEn =
          'Current growth measurements are within the expected range of the selected growth reference.';
        parentExpAr =
          'قياسات النمو الحالية تقع ضمن النطاق المتوقع وفق مرجع النمو المستخدم.';
        docRecEn =
          'Cross-sectional measurements fall within normal WHO limits. Longitudinal measurements will enhance trajectory interpretation.';
        docRecAr =
          'القياسات الحالية تقع ضمن الحدود الطبيعية لمنظمة الصحة العالمية. القياسات المستقبلية ستعزز تقييم مسار النمو.';
      }
    }

    // 9. DOCTOR VIEW SUMMARY (Section 16)
    const doctorViewIndicators: DoctorViewIndicator[] = applicableList.map((ind) => ({
      indicatorName: ind.indicatorNameEn,
      indicatorNameAr: ind.indicatorNameAr,
      measurementValue: `${ind.measurementValue} ${ind.measurementUnit}`,
      zScore: ind.zScore,
      zScoreDisplayed: ind.zScoreDisplayed,
      percentile: ind.percentile,
      percentileDisplayed: ind.percentileDisplayed,
      reference: ind.reference,
      dataset: ind.datasetName,
      calculationMethod: ind.calculationMethod,
      rawParameters: ind.lmsParameters,
      status: 'VALID',
      classification: ind.classificationEn,
    }));

    const technicalSummaryEn = `Assessment completed for age ${age.formattedAge} (${sex}). Total applicable indicators: ${applicableList.length}. Overall status: ${statusLevel}. Status strictly derived from deterministic WHO standard deviation cutoffs without AI generation.`;
    const technicalSummaryAr = `تم تقييم النمو لعمر ${age.formattedAge} (${sex === 'male' ? 'ذكر' : 'أنثى'}). عدد المؤشرات المطبقة: ${applicableList.length}. الحالة العامة: ${overallStatusAr}. الحالة ناتجة بالكامل عن قواعد منظمة الصحة العالمية القطعية دون ذكاء توليدي.`;

    const overallStatus = preferredLanguage === 'ar' ? overallStatusAr : overallStatusEn;
    const parentExplanation = preferredLanguage === 'ar' ? parentExpAr : parentExpEn;
    const doctorRecommendation = preferredLanguage === 'ar' ? docRecAr : docRecEn;

    return {
      overallStatus,
      overallStatusAr,
      overallStatusEn,
      statusLevel,
      badgeBg,
      badgeText,
      badgeBorder,
      iconSymbol,
      dotColor,
      reasons: reasonsEn.length > 0 ? reasonsEn : ['Measurements lie within expected WHO reference intervals.'],
      reasonsAr: reasonsAr.length > 0 ? reasonsAr : ['القياسات تقع ضمن النطاقات المعتادة لمرجع منظمة الصحة العالمية.'],
      indicators: evaluatedIndicators,
      applicableIndicatorsList: applicableList,
      trend: trendAnalysis,
      parentExplanation,
      parentExplanationAr: parentExpAr,
      parentExplanationEn: parentExpEn,
      doctorRecommendation,
      doctorRecommendationAr: docRecAr,
      doctorRecommendationEn: docRecEn,
      doctorView: {
        indicators: doctorViewIndicators,
        technicalSummaryEn,
        technicalSummaryAr,
      },
      metadata: {
        evaluatedAt: new Date().toISOString(),
        engineVersion: 'NMO-GrowthStatusEngine-v2.0',
        deterministicRulesOnly: true,
        aiGenerated: false,
      },
    };
  }

  /**
   * Evaluates longitudinal trend deterministically (Section 12).
   */
  private static analyzeLongitudinalTrend(
    currentIndicators: GrowthStatusEngineInput['indicators'],
    historicalAssessments: FullGrowthAssessmentResult[] = [],
    currentAge: AgeCalculationResult
  ): LongitudinalTrendAnalysis {
    // If only one measurement exists (or 0 historical points)
    if (historicalAssessments.length < 2) {
      return {
        hasLongitudinalData: false,
        pointsCount: historicalAssessments.length,
        trendCode: 'insufficient_longitudinal_data',
        trendLabelEn: 'Insufficient longitudinal data',
        trendLabelAr: 'بيانات طولية غير كافية',
        explanationEn:
          'Current measurement is available. Add future measurements to monitor the growth trajectory.',
        explanationAr:
          'القياس الحالي متوفر. أضف قياسات مستقبلية لمتابعة مسار النمو.',
        requiresFollowUp: false,
      };
    }

    // Sort historical assessments chronologically by age in days
    const sorted = [...historicalAssessments].sort((a, b) => a.age.ageInDays - b.age.ageInDays);
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    const timeSpanDays = latest.age.ageInDays - previous.age.ageInDays;

    // Compare primary indicators (Height/Length or WFL or BAZ)
    const currentPrimary =
      currentIndicators.heightLength?.zScore ??
      currentIndicators.weightForLengthOrHeight?.zScore ??
      currentIndicators.bmiForAge?.zScore ??
      0;

    const previousPrimary =
      previous.heightLength?.zScore ??
      previous.weightForLengthOrHeight?.zScore ??
      previous.bmiForAge?.zScore ??
      0;

    const deltaZ = Number((currentPrimary - previousPrimary).toFixed(3));

    // Notice Section 12 rule:
    // If there is a meaningful change that warrants follow-up (e.g. drop > 1.0 SD):
    // return NEEDS_FOLLOW_UP and explain:
    // "Recent measurements show a change in the recorded growth trajectory. Continued monitoring and discussion with a healthcare professional may be appropriate."
    if (deltaZ < -1.0) {
      return {
        hasLongitudinalData: true,
        pointsCount: sorted.length,
        trendCode: 'concerning_drop',
        trendLabelEn: 'Decelerating trajectory',
        trendLabelAr: 'تباطؤ في مسار النمو',
        explanationEn:
          'Recent measurements show a change in the recorded growth trajectory. Continued monitoring and discussion with a healthcare professional may be appropriate.',
        explanationAr:
          'تُظهر القياسات الأخيرة تغيراً في مسار النمو المسجل. يُنصح بمواصلة المتابعة ومناقشة ذلك مع أخصائي الرعاية الصحية.',
        deltaZScore: deltaZ,
        timeSpanDays,
        requiresFollowUp: true,
      };
    }

    if (deltaZ > 1.0) {
      return {
        hasLongitudinalData: true,
        pointsCount: sorted.length,
        trendCode: 'concerning_rise',
        trendLabelEn: 'Accelerating trajectory',
        trendLabelAr: 'تسارع في مسار النمو',
        explanationEn:
          'Recent measurements show an upward shift in growth trajectory. Continued routine monitoring is recommended.',
        explanationAr:
          'تُظهر القياسات الأخيرة تغيراً متصاعداً في مسار النمو المسجل. يُنصح بمواصلة المتابعة.',
        deltaZScore: deltaZ,
        timeSpanDays,
        requiresFollowUp: true,
      };
    }

    if (deltaZ > 0.6) {
      return {
        hasLongitudinalData: true,
        pointsCount: sorted.length,
        trendCode: 'accelerating',
        trendLabelEn: 'Upward trajectory',
        trendLabelAr: 'صاعد',
        explanationEn: 'Growth trajectory shows steady upward progress along percentile channels.',
        explanationAr: 'مسار النمو يتجه صعوداً بشكل متزن عبر القنوات المئينية.',
        deltaZScore: deltaZ,
        timeSpanDays,
        requiresFollowUp: false,
      };
    }

    if (deltaZ < -0.6) {
      return {
        hasLongitudinalData: true,
        pointsCount: sorted.length,
        trendCode: 'decelerating',
        trendLabelEn: 'Slowing trajectory',
        trendLabelAr: 'متباطئ',
        explanationEn: 'Growth trajectory indicates slight leveling off along percentile channels.',
        explanationAr: 'مسار النمو يظهر تباطؤاً طفيفاً مع البقاء ضمن النطاق المقبول.',
        deltaZScore: deltaZ,
        timeSpanDays,
        requiresFollowUp: false,
      };
    }

    // Default stable trajectory
    return {
      hasLongitudinalData: true,
      pointsCount: sorted.length,
      trendCode: 'stable',
      trendLabelEn: 'Stable trajectory',
      trendLabelAr: 'مستقر',
      explanationEn: 'Growth trajectory follows a consistent percentile band over recorded measurements.',
      explanationAr: 'مسار النمو يسير بنسق ثابت ومستقر عبر القياسات المسجلة.',
      deltaZScore: deltaZ,
      timeSpanDays,
      requiresFollowUp: false,
    };
  }

  /**
   * Helper to return Insufficient Data output (Section 13).
   */
  private static buildInsufficientDataOutput(lang: Language): GrowthStatusEngineOutput {
    const parentExpAr = 'أكمل قياسات النمو المطلوبة حتى يتمكن التطبيق من تقديم متابعة أكثر فائدة.';
    const parentExpEn = 'Complete the required growth measurements so the application can provide more useful monitoring.';

    return {
      overallStatus: lang === 'ar' ? 'بيانات غير كافية' : 'Insufficient Data',
      overallStatusAr: 'بيانات غير كافية',
      overallStatusEn: 'Insufficient Data',
      statusLevel: 'DATA_INSUFFICIENT',
      badgeBg: 'bg-slate-800/80',
      badgeText: 'text-slate-300',
      badgeBorder: 'border-slate-700',
      iconSymbol: '⚪',
      dotColor: 'bg-slate-400',
      reasons: ['Required anthropometric measurements (length/height or weight) are missing or incomplete.'],
      reasonsAr: ['القياسات المطلوبة (الطول أو الوزن) غير مكتملة لتحديد حالة النمو.'],
      indicators: {},
      applicableIndicatorsList: [],
      trend: {
        hasLongitudinalData: false,
        pointsCount: 0,
        trendCode: 'insufficient_longitudinal_data',
        trendLabelEn: 'Insufficient data',
        trendLabelAr: 'بيانات غير كافية',
        explanationEn: 'No measurements recorded yet.',
        explanationAr: 'لم يتم تسجيل قياسات بعد.',
        requiresFollowUp: false,
      },
      parentExplanation: lang === 'ar' ? parentExpAr : parentExpEn,
      parentExplanationAr: parentExpAr,
      parentExplanationEn: parentExpEn,
      doctorRecommendation: 'Obtain complete and valid anthropometric measurements to enable calculation of WHO growth indicators.',
      doctorRecommendationAr: 'يرجى تسجيل قياسات جسمية مكتملة لحساب مؤشرات النمو لمنظمة الصحة العالمية.',
      doctorRecommendationEn: 'Obtain complete and valid anthropometric measurements to enable calculation of WHO growth indicators.',
      doctorView: {
        indicators: [],
        technicalSummaryEn: 'Insufficient data: No valid indicators calculated.',
        technicalSummaryAr: 'بيانات غير كافية: لم يتم حساب أي مؤشر صالح.',
      },
      metadata: {
        evaluatedAt: new Date().toISOString(),
        engineVersion: 'NMO-GrowthStatusEngine-v2.0',
        deterministicRulesOnly: true,
        aiGenerated: false,
      },
    };
  }

  /**
   * Convenience Adapter for Dashboard Card (Maintains full backward compatibility).
   */
  public static evaluateChildGrowthStatus(
    latestAssessment?: FullGrowthAssessmentResult,
    historyAssessments: FullGrowthAssessmentResult[] = [],
    lang: Language = 'ar'
  ): DashboardGrowthStatus {
    if (!latestAssessment) {
      return {
        isReady: false,
        statusCategory: 'awaiting',
        statusLabel: lang === 'ar' ? 'بانتظار اكتمال تحليل النمو' : 'Awaiting Growth Analysis',
        badgeBg: 'bg-slate-800/80',
        badgeText: 'text-slate-300',
        badgeBorder: 'border-slate-700',
        dotColor: 'bg-slate-400',
        iconSymbol: '⚪',
        subtitle: lang === 'ar' ? 'بانتظار تسجيل أول قياس للطفل' : 'Awaiting recorded measurements',
        growthTrend: lang === 'ar' ? 'بانتظار القياسات' : 'Awaiting data',
        growthTrendCode: 'awaiting',
      };
    }

    const input: GrowthStatusEngineInput = {
      childId: latestAssessment.childId,
      age: latestAssessment.age,
      sex: latestAssessment.heightLength?.sex || 'male',
      indicators: {
        heightLength: latestAssessment.heightLength,
        weightForAge: latestAssessment.weightForAge,
        weightForLengthOrHeight: latestAssessment.weightForLengthOrHeight,
        bmiForAge: latestAssessment.bmiForAge,
        headCircumferenceForAge: latestAssessment.headCircumferenceForAge,
      },
      historicalAssessments: historyAssessments,
    };

    const evaluated = this.evaluate(input, lang);

    // Map status level to category code
    let statusCategory: DashboardGrowthStatus['statusCategory'] = 'within_expected';
    if (evaluated.statusLevel === 'REASSURING_GROWTH') statusCategory = 'reassuring_growth';
    else if (evaluated.statusLevel === 'WITHIN_EXPECTED_RANGE') statusCategory = 'within_expected';
    else if (evaluated.statusLevel === 'NEEDS_FOLLOW_UP') statusCategory = 'needs_followup';
    else if (evaluated.statusLevel === 'CONSIDER_MEDICAL_REVIEW') statusCategory = 'consider_review';
    else if (evaluated.statusLevel === 'DATA_INSUFFICIENT') statusCategory = 'awaiting';

    const growthTrend = lang === 'ar' ? evaluated.trend.trendLabelAr : evaluated.trend.trendLabelEn;
    let growthTrendCode: DashboardGrowthStatus['growthTrendCode'] = 'stable';
    if (evaluated.trend.trendCode === 'insufficient_longitudinal_data') growthTrendCode = 'awaiting';
    else if (evaluated.trend.trendCode === 'accelerating' || evaluated.trend.trendCode === 'concerning_rise') growthTrendCode = 'accelerating';
    else if (evaluated.trend.trendCode === 'decelerating' || evaluated.trend.trendCode === 'concerning_drop') growthTrendCode = 'slowing';

    const subtitle =
      lang === 'ar' ? 'بناءً على آخر قياسات مسجلة' : 'Based on latest recorded measurements';

    return {
      isReady: evaluated.statusLevel !== 'DATA_INSUFFICIENT',
      statusCategory,
      statusLabel: evaluated.overallStatus,
      badgeBg: evaluated.badgeBg,
      badgeText: evaluated.badgeText,
      badgeBorder: evaluated.badgeBorder,
      dotColor: evaluated.dotColor,
      iconSymbol: evaluated.iconSymbol,
      subtitle,
      growthTrend,
      growthTrendCode,
      fullOutput: evaluated,
    };
  }

  /**
   * Technical categorization method preserved for backward compatibility.
   */
  public static evaluateTechnicalStatus(
    assessment: FullGrowthAssessmentResult,
    longitudinalAssessmentsHistory: FullGrowthAssessmentResult[] = []
  ): TechnicalGrowthStatus {
    const indicatorSummaries: IndicatorSummary[] = [];
    const technicalNotes: string[] = [];

    const getCat = (z: number, status: string): IndicatorSummary['technicalRangeCategory'] => {
      if (status !== 'VALID') return 'not_applicable';
      if (z < -3.0) return 'severe_low';
      if (z < -2.0) return 'low';
      if (z > 3.0) return 'severe_high';
      if (z > 2.0) return 'high';
      return 'normal';
    };

    const processIndicator = (res?: IndicatorCalculationResult) => {
      if (!res) return;
      indicatorSummaries.push({
        indicator: res.indicator,
        measurementValue: res.measurement,
        unit: res.measurementUnit,
        zScore: res.zScore,
        percentile: res.percentile,
        zScoreDisplayed: res.zScoreDisplayed,
        percentileDisplayed: res.percentileDisplayed,
        technicalRangeCategory: getCat(res.zScore, res.status),
        status: res.status,
      });

      if (res.status === 'NOT_APPLICABLE') {
        technicalNotes.push(`${res.indicator}: Marked NOT_APPLICABLE for age ${assessment.age.formattedAge}.`);
      }
    };

    processIndicator(assessment.heightLength);
    processIndicator(assessment.weightForAge);
    processIndicator(assessment.weightForLengthOrHeight);
    processIndicator(assessment.bmiForAge);
    processIndicator(assessment.headCircumferenceForAge);

    return {
      calculationId: assessment.calculationId,
      timestamp: new Date().toISOString(),
      ageFormatted: assessment.age.formattedAge,
      referenceUsed: `${assessment.reference} (${assessment.referenceVersion})`,
      indicatorSummaries,
      hasLongitudinalData: longitudinalAssessmentsHistory.length > 0,
      longitudinalPointsCount: longitudinalAssessmentsHistory.length,
      technicalNotes,
    };
  }
}

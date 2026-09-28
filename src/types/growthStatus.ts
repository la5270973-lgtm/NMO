/**
 * NMO | نمو — Child Growth Application
 * Phase 2: Growth Status Engine Types
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 * Brand: نمو | NMO
 */

import {
  AgeCalculationResult,
  FullGrowthAssessmentResult,
  IndicatorCalculationResult,
  IndicatorType,
  Sex,
  WHOReferenceName,
} from './growth.ts';

export type GrowthStatusLevel =
  | 'DATA_INSUFFICIENT'
  | 'REASSURING_GROWTH'
  | 'WITHIN_EXPECTED_RANGE'
  | 'NEEDS_FOLLOW_UP'
  | 'CONSIDER_MEDICAL_REVIEW';

export type LongitudinalTrendCode =
  | 'insufficient_longitudinal_data'
  | 'stable'
  | 'accelerating'
  | 'decelerating'
  | 'concerning_drop'
  | 'concerning_rise';

export interface LongitudinalTrendAnalysis {
  hasLongitudinalData: boolean;
  pointsCount: number;
  trendCode: LongitudinalTrendCode;
  trendLabelEn: string;
  trendLabelAr: string;
  explanationEn: string;
  explanationAr: string;
  deltaZScore?: number;
  timeSpanDays?: number;
  requiresFollowUp: boolean;
}

export interface IndicatorStatusEvaluation {
  indicator: IndicatorType;
  indicatorNameEn: string;
  indicatorNameAr: string;
  isApplicable: boolean;
  measurementValue: number;
  measurementUnit: string;
  zScore: number;
  zScoreDisplayed: string;
  percentile: number;
  percentileDisplayed: string;
  reference: WHOReferenceName;
  referenceVersion: string;
  datasetName: string;
  calculationMethod: string;
  classificationCode: string;
  classificationEn: string;
  classificationAr: string;
  parentExplanationEn: string;
  parentExplanationAr: string;
  doctorNoteEn: string;
  doctorNoteAr: string;
  requiresFollowUp: boolean;
  requiresMedicalReview: boolean;
  lmsParameters?: { L: number; M: number; S: number };
}

export interface GrowthStatusEngineInput {
  childId?: string;
  age: AgeCalculationResult;
  sex: Sex;
  indicators: {
    heightLength?: IndicatorCalculationResult;
    weightForAge?: IndicatorCalculationResult;
    weightForLengthOrHeight?: IndicatorCalculationResult;
    bmiForAge?: IndicatorCalculationResult;
    headCircumferenceForAge?: IndicatorCalculationResult;
  };
  historicalAssessments?: FullGrowthAssessmentResult[];
  dataSufficiency?: {
    hasHeight: boolean;
    hasWeight: boolean;
    hasAge: boolean;
    hasSex: boolean;
  };
}

export interface DoctorViewIndicator {
  indicatorName: string;
  indicatorNameAr: string;
  measurementValue: string;
  zScore: number;
  zScoreDisplayed: string;
  percentile: number;
  percentileDisplayed: string;
  reference: string;
  dataset: string;
  calculationMethod: string;
  rawParameters?: { L: number; M: number; S: number };
  status: string;
  classification: string;
}

export interface GrowthStatusEngineOutput {
  overallStatus: string;
  overallStatusAr: string;
  overallStatusEn: string;
  statusLevel: GrowthStatusLevel;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconSymbol: string;
  dotColor: string;
  reasons: string[];
  reasonsAr: string[];
  indicators: Partial<Record<IndicatorType, IndicatorStatusEvaluation>>;
  applicableIndicatorsList: IndicatorStatusEvaluation[];
  trend: LongitudinalTrendAnalysis;
  parentExplanation: string;
  parentExplanationAr: string;
  parentExplanationEn: string;
  doctorRecommendation: string;
  doctorRecommendationAr: string;
  doctorRecommendationEn: string;
  doctorView: {
    indicators: DoctorViewIndicator[];
    technicalSummaryEn: string;
    technicalSummaryAr: string;
  };
  metadata: {
    evaluatedAt: string;
    engineVersion: string;
    deterministicRulesOnly: boolean;
    aiGenerated: false;
  };
}

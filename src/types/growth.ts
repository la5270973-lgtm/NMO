/**
 * NMO | نمو — Child Growth Application
 * Phase 1: WHO Growth Engine Types
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

export type Sex = 'male' | 'female';

export type IndicatorType =
  | 'LENGTH_FOR_AGE'
  | 'HEIGHT_FOR_AGE'
  | 'LENGTH_HEIGHT_FOR_AGE'
  | 'WEIGHT_FOR_AGE'
  | 'WEIGHT_FOR_LENGTH'
  | 'WEIGHT_FOR_HEIGHT'
  | 'BMI_FOR_AGE'
  | 'HEAD_CIRCUMFERENCE_FOR_AGE';

export type MeasurementPosition = 'recumbent' | 'standing' | 'auto';

export type WHOReferenceName =
  | 'WHO Child Growth Standards'
  | 'WHO 2007 Growth Reference';

export type CalculationStatus =
  | 'VALID'
  | 'WHO_DATA_MISSING'
  | 'AGE_OUT_OF_RANGE'
  | 'INVALID_MEASUREMENT'
  | 'SEX_REQUIRED'
  | 'INVALID_DATE'
  | 'INVALID_MEASUREMENT_DATE'
  | 'NOT_APPLICABLE';

export interface AgeCalculationResult {
  ageInDays: number;
  ageInMonths: number;
  ageInYears: number;
  completedYears: number;
  completedMonths: number;
  remainingDays: number;
  totalCompletedMonths: number;
  formattedAge: string;
  isLeapYearChild: boolean;
  birthDateISO: string;
  measurementDateISO: string;
}

export interface LMSDataPoint {
  key: number; // Day (0-1856), Month (0-228), or Length/Height (45.0-120.0 cm)
  L: number;
  M: number;
  S: number;
  SD4neg?: number;
  SD3neg?: number;
  SD2neg?: number;
  SD1neg?: number;
  SD0?: number;
  SD1?: number;
  SD2?: number;
  SD3?: number;
  SD4?: number;
}

export interface DatasetMetadata {
  source: string;
  sourceUrl: string;
  referenceName: WHOReferenceName;
  version: string;
  indicator: IndicatorType;
  sex: Sex;
  minimumAge: string;
  maximumAge: string;
  units: string;
  datasetType: string;
  keyVariable: string;
  pointsCount: number;
}

export interface WHODatasetFile {
  metadata: DatasetMetadata;
  data: LMSDataPoint[];
}

export interface IndicatorCalculationResult {
  indicator: IndicatorType;
  sex: Sex;
  ageInMonths: number;
  ageInDays: number;
  measurement: number;
  measurementUnit: string;
  zScore: number; // Official WHO adjusted Z-score
  zScoreRaw: number; // Raw LMS Z-score before extreme correction
  zScoreDisplayed: string; // e.g. "-0.42"
  percentile: number; // 0.01 to 99.99
  percentileRaw: number;
  percentileDisplayed: string; // e.g. "33.7th"
  reference: WHOReferenceName;
  referenceVersion: string;
  source: string;
  calculatedAt: string;
  status: CalculationStatus;
  errorMessage?: string;
  metadata: {
    lms: { L: number; M: number; S: number };
    keyUsed: number;
    interpolated: boolean;
    extremeAdjustmentApplied: boolean;
    positionAdjustmentApplied?: {
      originalValue: number;
      adjustedValue: number;
      rule: string;
    };
    notes?: string;
  };
}

export interface GrowthAssessmentInput {
  childId?: string;
  measurementId?: string;
  sex: Sex;
  dateOfBirth: string | Date;
  measurementDate: string | Date;
  weightKg?: number;
  heightLengthCm?: number;
  measurementPosition?: MeasurementPosition;
  headCircumferenceCm?: number;
}

export interface CalculationAuditRecord {
  calculationId: string;
  childId?: string;
  measurementId?: string;
  indicator: IndicatorType;
  sex: Sex;
  age: {
    days: number;
    months: number;
    completedYears: number;
    completedMonths: number;
  };
  measurement: number;
  reference: string;
  referenceVersion: string;
  dataset: string;
  zScore: number;
  percentile: number;
  calculationMethod: string;
  timestamp: string;
}

export interface FullGrowthAssessmentResult {
  calculationId: string;
  childId?: string;
  measurementId?: string;
  age: AgeCalculationResult;
  reference: WHOReferenceName;
  referenceVersion: string;
  heightLength?: IndicatorCalculationResult;
  weightForAge?: IndicatorCalculationResult;
  weightForLengthOrHeight?: IndicatorCalculationResult;
  bmiForAge?: IndicatorCalculationResult;
  headCircumferenceForAge?: IndicatorCalculationResult;
  calculatedBMI?: number;
  auditRecords: CalculationAuditRecord[];
  status: CalculationStatus;
  errors: string[];
}

export interface ValidationTestCase {
  id: string;
  name: string;
  description: string;
  sex: Sex;
  dateOfBirth: string;
  measurementDate: string;
  weightKg?: number;
  heightLengthCm?: number;
  headCircumferenceCm?: number;
  measurementPosition?: MeasurementPosition;
  ageBand: '0–6 months' | '6–12 months' | '1–2 years' | '2–5 years' | '5–10 years' | '10–15 years' | '15–19 years';
  category: 'low' | 'median' | 'high' | 'boundary' | 'error_check';
  expectedIndicator: IndicatorType;
  expectedZScore: number;
  expectedPercentile?: number;
  tolerance: number; // e.g. 0.05
}

export interface ValidationTestResult {
  testCase: ValidationTestCase;
  calculatedZScore?: number;
  calculatedPercentile?: number;
  zDifference?: number;
  passed: boolean;
  status: CalculationStatus;
  notes: string;
}

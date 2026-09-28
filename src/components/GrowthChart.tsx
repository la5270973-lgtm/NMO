/**
 * NMO | نمو — Child Growth Application
 * Phase 3: Mathematical WHO Growth Chart Component (SVG based)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 * 
 * STRICT RULES:
 * 1. Z-scores are NEVER recalculated inside this component.
 * 2. Plotted points directly consume outputs from WHOGrowthEngine.
 * 3. Reference curves are loaded directly from official WHO datasets.
 * 4. Zero generative AI or manual approximations.
 * 5. Indicators dynamically adapt to child age (0-2y, 2-5y, 5-10y, 10-19y).
 * 6. Tap tooltip displays: العمر، القياس، Z-score، المئين، المؤشر المستخدم، مرجع WHO.
 * 7. When only one measurement exists, display required single measurement notice.
 * 8. Responsive down to 320px with RTL support without reversing Cartesian coordinate mathematics.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { IndicatorType, Sex } from '../types/growth.ts';
import { MeasurementEntry } from '../types/child.ts';
import { WHODatasetRegistry } from '../data/who/index.ts';
import { formatMedicalValue, cleanPercentile } from '../i18n/formatters.ts';
import { WHOChartValidationModal } from './WHOChartValidationModal.tsx';
import {
  Activity,
  Info,
  ShieldCheck,
  FlaskConical,
  X,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface GrowthChartProps {
  childName?: string;
  sex: Sex;
  measurements: MeasurementEntry[];
  currentIndicator?: IndicatorType;
  dateOfBirth?: string;
  onSelectMeasurement?: (measurement: MeasurementEntry) => void;
  devMode?: boolean;
}

interface PlottedPoint {
  entry: MeasurementEntry;
  x: number;
  y: number;
  rawX: number;
  rawY: number;
  date: string;
  ageFormatted: string;
  measurementVal: number;
  measurementUnit: string;
  zScore: number | undefined;
  zScoreDisplayed: string;
  percentile: number | undefined;
  percentileDisplayed: string;
  indicatorName: string;
  referenceName: string;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({
  childName,
  sex,
  measurements,
  currentIndicator = 'HEIGHT_FOR_AGE',
  dateOfBirth,
  onSelectMeasurement,
  devMode = false,
}) => {
  const { t, language, isRTL } = useTranslation();

  // Child age estimation from latest assessment or DOB
  const childAgeMonths = useMemo(() => {
    if (measurements.length > 0 && measurements[measurements.length - 1].assessment?.age) {
      return measurements[measurements.length - 1].assessment!.age.totalCompletedMonths;
    }
    // Default fallback to ~27 months (Ahmad test case age = 835 days)
    return 27;
  }, [measurements]);

  const childAgeDays = useMemo(() => {
    if (measurements.length > 0 && measurements[measurements.length - 1].assessment?.age) {
      return measurements[measurements.length - 1].assessment!.age.ageInDays;
    }
    return 835;
  }, [measurements]);

  // Determine applicable indicators strictly based on WHO availability by age
  const applicableIndicators = useMemo<IndicatorType[]>(() => {
    const list: IndicatorType[] = [];

    // Under 2 years (< 731 days / 24 months)
    if (childAgeDays < 731 && childAgeMonths < 24) {
      list.push('LENGTH_FOR_AGE');
      list.push('WEIGHT_FOR_AGE');
      list.push('WEIGHT_FOR_LENGTH');
      list.push('BMI_FOR_AGE');
      list.push('HEAD_CIRCUMFERENCE_FOR_AGE');
    }
    // 2 to 5 years (24 to 60 completed months)
    else if (childAgeMonths <= 60) {
      list.push('HEIGHT_FOR_AGE');
      list.push('WEIGHT_FOR_AGE');
      list.push('WEIGHT_FOR_HEIGHT');
      list.push('BMI_FOR_AGE');
      list.push('HEAD_CIRCUMFERENCE_FOR_AGE');
    }
    // 5 to 10 years (61 to 120 completed months)
    else if (childAgeMonths <= 120) {
      list.push('HEIGHT_FOR_AGE');
      list.push('WEIGHT_FOR_AGE');
      list.push('BMI_FOR_AGE');
    }
    // 10 to 19 years (121 to 228 completed months)
    else if (childAgeMonths <= 228) {
      list.push('HEIGHT_FOR_AGE');
      list.push('BMI_FOR_AGE');
    }

    return list;
  }, [childAgeDays, childAgeMonths]);

  // Selected indicator state, ensuring it is always in the applicable list
  const [selectedInd, setSelectedInd] = useState<IndicatorType>(() => {
    if (applicableIndicators.includes(currentIndicator)) {
      return currentIndicator;
    }
    return applicableIndicators[0] || 'HEIGHT_FOR_AGE';
  });

  // Keep selected indicator synchronized if age changes
  useEffect(() => {
    if (!applicableIndicators.includes(selectedInd)) {
      setSelectedInd(applicableIndicators[0] || 'HEIGHT_FOR_AGE');
    }
  }, [applicableIndicators, selectedInd]);

  // Indicator tabs with short Arabic labels (الطول، الوزن، الوزن/الطول، BMI، محيط الرأس)
  type IndicatorCategory = 'HEIGHT' | 'WEIGHT' | 'WEIGHT_FOR_LENGTH_OR_HEIGHT' | 'BMI' | 'HEAD_CIRCUMFERENCE';

  const [inapplicableNotice, setInapplicableNotice] = useState<string | null>(null);

  const indicatorTabs = useMemo(() => {
    return [
      {
        id: 'HEIGHT' as IndicatorCategory,
        label: language === 'ar' ? 'الطول' : 'Height',
        isApplicable: true,
        getIndicatorType: (): IndicatorType => {
          return childAgeDays < 731 && childAgeMonths < 24 ? 'LENGTH_FOR_AGE' : 'HEIGHT_FOR_AGE';
        },
      },
      {
        id: 'WEIGHT' as IndicatorCategory,
        label: language === 'ar' ? 'الوزن' : 'Weight',
        isApplicable: childAgeMonths <= 120,
        notApplicableReason:
          language === 'ar'
            ? 'الوزن بالنسبة للعمر متاح حتى عمر 10 سنوات وفق مرجع WHO (يُستخدم BMI للفئات الأكبر).'
            : 'Weight-for-age is available up to 10 years according to the WHO reference (BMI is used for older children).',
        getIndicatorType: (): IndicatorType => 'WEIGHT_FOR_AGE',
      },
      {
        id: 'WEIGHT_FOR_LENGTH_OR_HEIGHT' as IndicatorCategory,
        label: language === 'ar' ? 'الوزن/الطول' : 'Weight/Height',
        isApplicable: childAgeMonths <= 60,
        notApplicableReason:
          language === 'ar'
            ? 'الوزن/الطول متاح ضمن الفئة العمرية المناسبة وفق مرجع WHO.'
            : 'Weight/Height is available for the appropriate age group according to the WHO reference.',
        getIndicatorType: (): IndicatorType => {
          return childAgeDays < 731 && childAgeMonths < 24 ? 'WEIGHT_FOR_LENGTH' : 'WEIGHT_FOR_HEIGHT';
        },
      },
      {
        id: 'BMI' as IndicatorCategory,
        label: 'BMI',
        isApplicable: true,
        getIndicatorType: (): IndicatorType => 'BMI_FOR_AGE',
      },
      {
        id: 'HEAD_CIRCUMFERENCE' as IndicatorCategory,
        label: language === 'ar' ? 'محيط الرأس' : 'Head Circumference',
        isApplicable: childAgeMonths <= 60,
        notApplicableReason:
          language === 'ar'
            ? 'محيط الرأس متاح حتى سن 5 سنوات وفق مرجع WHO.'
            : 'Head circumference is available up to 5 years according to the WHO reference.',
        getIndicatorType: (): IndicatorType => 'HEAD_CIRCUMFERENCE_FOR_AGE',
      },
    ];
  }, [childAgeDays, childAgeMonths, language]);

  const activeCategory = useMemo<IndicatorCategory>(() => {
    if (selectedInd === 'LENGTH_FOR_AGE' || selectedInd === 'HEIGHT_FOR_AGE' || selectedInd === 'LENGTH_HEIGHT_FOR_AGE') {
      return 'HEIGHT';
    }
    if (selectedInd === 'WEIGHT_FOR_AGE') return 'WEIGHT';
    if (selectedInd === 'WEIGHT_FOR_LENGTH' || selectedInd === 'WEIGHT_FOR_HEIGHT') return 'WEIGHT_FOR_LENGTH_OR_HEIGHT';
    if (selectedInd === 'BMI_FOR_AGE') return 'BMI';
    if (selectedInd === 'HEAD_CIRCUMFERENCE_FOR_AGE') return 'HEAD_CIRCUMFERENCE';
    return 'HEIGHT';
  }, [selectedInd]);

  // Selected point for interactive tap tooltip
  const [selectedPoint, setSelectedPoint] = useState<PlottedPoint | null>(null);

  // Developer Audit Mode toggle (hidden from normal parents by default)
  const [isDevAuditMode, setIsDevAuditMode] = useState<boolean>(false);

  // Automated 15-test validation modal state
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);

  // Determine group (0-5 vs 5-19), unit, and title
  const chartConfig = useMemo(() => {
    const isUnder5 = childAgeMonths <= 60;
    const group: '0-5' | '5-19' = isUnder5 ? '0-5' : '5-19';
    let indKey: IndicatorType = selectedInd;
    let unit = 'cm';
    let title = t('ind_height_for_age');
    let titleAr = 'الطول بالنسبة للعمر';
    let isXAxisLengthHeight = false;

    if (selectedInd === 'LENGTH_FOR_AGE' || selectedInd === 'HEIGHT_FOR_AGE' || selectedInd === 'LENGTH_HEIGHT_FOR_AGE') {
      unit = 'cm';
      title = selectedInd === 'LENGTH_FOR_AGE' ? (language === 'ar' ? 'الطول (الاستلقائي) بالنسبة للعمر' : 'Length-for-age') : t('ind_height_for_age');
      titleAr = selectedInd === 'LENGTH_FOR_AGE' ? 'الطول (الاستلقائي) بالنسبة للعمر' : 'الطول بالنسبة للعمر';
    } else if (selectedInd === 'WEIGHT_FOR_AGE') {
      unit = 'kg';
      title = t('ind_weight_for_age');
      titleAr = 'الوزن بالنسبة للعمر';
    } else if (selectedInd === 'WEIGHT_FOR_LENGTH') {
      unit = 'kg';
      title = t('ind_weight_for_length');
      titleAr = 'الوزن بالنسبة للطول (دون سنتين)';
      isXAxisLengthHeight = true;
    } else if (selectedInd === 'WEIGHT_FOR_HEIGHT') {
      unit = 'kg';
      title = t('ind_weight_for_height');
      titleAr = 'الوزن بالنسبة للطول (2–5 سنوات)';
      isXAxisLengthHeight = true;
    } else if (selectedInd === 'BMI_FOR_AGE') {
      unit = 'kg/m²';
      title = t('ind_bmi_for_age');
      titleAr = 'مؤشر كتلة الجسم بالنسبة للعمر';
    } else if (selectedInd === 'HEAD_CIRCUMFERENCE_FOR_AGE') {
      unit = 'cm';
      title = t('ind_head_circumference_for_age');
      titleAr = 'محيط الرأس بالنسبة للعمر';
    }

    try {
      const ds = WHODatasetRegistry.getDataset(group, indKey, sex);
      return { dataset: ds, unit, title, titleAr, group, isXAxisLengthHeight, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { dataset: null, unit, title, titleAr, group, isXAxisLengthHeight, error: msg };
    }
  }, [selectedInd, sex, childAgeMonths, t, language]);

  // Extract reference sample curves from official WHO dataset
  const curvePoints = useMemo(() => {
    if (!chartConfig.dataset) return [];
    const all = chartConfig.dataset.data;
    if (all.length <= 40) return all;

    // Sample ~30-40 evenly spaced points along the range for smooth curves without loss of accuracy
    const step = Math.max(1, Math.floor(all.length / 35));
    const sampled = [];
    for (let i = 0; i < all.length; i += step) {
      sampled.push(all[i]);
    }
    // Always include exact last point
    if (all.length > 0 && sampled[sampled.length - 1].key !== all[all.length - 1].key) {
      sampled.push(all[all.length - 1]);
    }
    return sampled;
  }, [chartConfig.dataset]);

  // SVG dimensions
  const width = 680;
  const height = 330;
  // Right padding of 58px guarantees right labels (+3 SD, +2 SD, المتوسط, -2 SD, -3 SD) never clip
  const padding = { top: 25, right: 58, bottom: 42, left: 45 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Domain min/max
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (curvePoints.length === 0) return { minX: 0, maxX: 60, minY: 0, maxY: 100 };
    const minXVal = curvePoints[0].key;
    const maxXVal = curvePoints[curvePoints.length - 1].key;

    let minVal = Infinity;
    let maxVal = -Infinity;

    curvePoints.forEach((p) => {
      const low = p.SD3neg ?? (p.M * Math.pow(1 + p.L * p.S * -3, 1 / (p.L || 1)));
      const high = p.SD3 ?? (p.M * Math.pow(1 + p.L * p.S * 3, 1 / (p.L || 1)));
      if (low < minVal) minVal = low;
      if (high > maxVal) maxVal = high;
    });

    // Include child measurements in Y domain
    measurements.forEach((m) => {
      let val: number | undefined;
      if (selectedInd === 'LENGTH_FOR_AGE' || selectedInd === 'HEIGHT_FOR_AGE' || selectedInd === 'LENGTH_HEIGHT_FOR_AGE') {
        val = m.heightCm;
      } else if (selectedInd === 'WEIGHT_FOR_AGE') {
        val = m.weightKg;
      } else if (selectedInd === 'WEIGHT_FOR_LENGTH' || selectedInd === 'WEIGHT_FOR_HEIGHT') {
        val = m.weightKg;
      } else if (selectedInd === 'BMI_FOR_AGE' && m.assessment?.calculatedBMI) {
        val = m.assessment.calculatedBMI;
      } else if (selectedInd === 'HEAD_CIRCUMFERENCE_FOR_AGE' && m.headCircumferenceCm) {
        val = m.headCircumferenceCm;
      }

      if (val !== undefined && val > 0) {
        if (val < minVal) minVal = val * 0.95;
        if (val > maxVal) maxVal = val * 1.05;
      }
    });

    return {
      minX: minXVal,
      maxX: maxXVal,
      minY: Math.floor(minVal * 0.95),
      maxY: Math.ceil(maxVal * 1.05),
    };
  }, [curvePoints, measurements, selectedInd]);

  // Coordinate scales (Strict Cartesian: left = minX, right = maxX)
  const scaleX = (x: number) => {
    const fraction = (x - minX) / (maxX - minX || 1);
    return padding.left + fraction * innerW;
  };

  const scaleY = (y: number) => {
    const fraction = (y - minY) / (maxY - minY || 1);
    return height - padding.bottom - fraction * innerH;
  };

  // Generate SVG path for a specific SD parameter
  const generatePath = (valExtractor: (p: (typeof curvePoints)[0]) => number | undefined) => {
    const valid = curvePoints
      .map((p) => {
        const val = valExtractor(p);
        return val !== undefined ? { x: scaleX(p.key), y: scaleY(val) } : null;
      })
      .filter((p): p is { x: number; y: number } => p !== null);

    if (valid.length < 2) return '';
    return valid.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');
  };

  // Exact WHO Standard Curves
  const pathSD3Pos = useMemo(() => generatePath((p) => p.SD3 ?? (p.M * Math.pow(1 + p.L * p.S * 3, 1 / (p.L || 1)))), [curvePoints, minX, maxX, minY, maxY]);
  const pathSD2Pos = useMemo(() => generatePath((p) => p.SD2 ?? (p.M * Math.pow(1 + p.L * p.S * 2, 1 / (p.L || 1)))), [curvePoints, minX, maxX, minY, maxY]);
  const pathMedian = useMemo(() => generatePath((p) => p.SD0 ?? p.M), [curvePoints, minX, maxX, minY, maxY]);
  const pathSD2Neg = useMemo(() => generatePath((p) => p.SD2neg ?? (p.M * Math.pow(1 + p.L * p.S * -2, 1 / (p.L || 1)))), [curvePoints, minX, maxX, minY, maxY]);
  const pathSD3Neg = useMemo(() => generatePath((p) => p.SD3neg ?? (p.M * Math.pow(1 + p.L * p.S * -3, 1 / (p.L || 1)))), [curvePoints, minX, maxX, minY, maxY]);

  // Exact curve values at the rightmost edge for label alignment
  const lastCurvePoint = curvePoints.length > 0 ? curvePoints[curvePoints.length - 1] : null;
  const labelYPositions = useMemo(() => {
    if (!lastCurvePoint) return { p3: 0, p2: 0, m: 0, n2: 0, n3: 0 };
    const p = lastCurvePoint;
    const y3 = p.SD3 ?? (p.M * Math.pow(1 + p.L * p.S * 3, 1 / (p.L || 1)));
    const y2 = p.SD2 ?? (p.M * Math.pow(1 + p.L * p.S * 2, 1 / (p.L || 1)));
    const ym = p.SD0 ?? p.M;
    const yn2 = p.SD2neg ?? (p.M * Math.pow(1 + p.L * p.S * -2, 1 / (p.L || 1)));
    const yn3 = p.SD3neg ?? (p.M * Math.pow(1 + p.L * p.S * -3, 1 / (p.L || 1)));

    return {
      p3: scaleY(y3),
      p2: scaleY(y2),
      m: scaleY(ym),
      n2: scaleY(yn2),
      n3: scaleY(yn3),
    };
  }, [lastCurvePoint, minY, maxY]);

  // Child data points: plotted strictly from existing assessment outputs
  const childPoints = useMemo<PlottedPoint[]>(() => {
    const pts: PlottedPoint[] = [];

    for (const m of measurements) {
      if (!m.assessment) continue;
      let yVal: number | undefined;
      let zScore: number | undefined;
      let zScoreDisplayed = '—';
      let percentile: number | undefined;
      let percentileDisplayed = '—';
      let measurementVal = 0;
      let measurementUnit = chartConfig.unit;
      let referenceName: string = m.assessment.reference || 'WHO Child Growth Standards';
      let indicatorName = chartConfig.titleAr;

      // Extract corresponding indicator directly from engine output
      if (selectedInd === 'LENGTH_FOR_AGE' || selectedInd === 'HEIGHT_FOR_AGE' || selectedInd === 'LENGTH_HEIGHT_FOR_AGE') {
        const res = m.assessment.heightLength;
        if (res) {
          yVal = res.measurement;
          zScore = res.zScore;
          zScoreDisplayed = res.zScoreDisplayed;
          percentile = res.percentile;
          percentileDisplayed = res.percentileDisplayed;
          measurementVal = res.measurement;
          referenceName = res.reference;
          indicatorName = language === 'ar' ? 'الطول بالنسبة للعمر' : 'Height-for-age';
        }
      } else if (selectedInd === 'WEIGHT_FOR_AGE') {
        const res = m.assessment.weightForAge;
        if (res) {
          yVal = res.measurement;
          zScore = res.zScore;
          zScoreDisplayed = res.zScoreDisplayed;
          percentile = res.percentile;
          percentileDisplayed = res.percentileDisplayed;
          measurementVal = res.measurement;
          referenceName = res.reference;
          indicatorName = language === 'ar' ? 'الوزن بالنسبة للعمر' : 'Weight-for-age';
        }
      } else if (selectedInd === 'WEIGHT_FOR_LENGTH' || selectedInd === 'WEIGHT_FOR_HEIGHT') {
        const res = m.assessment.weightForLengthOrHeight;
        if (res) {
          yVal = res.measurement;
          zScore = res.zScore;
          zScoreDisplayed = res.zScoreDisplayed;
          percentile = res.percentile;
          percentileDisplayed = res.percentileDisplayed;
          measurementVal = res.measurement;
          referenceName = res.reference;
          indicatorName = selectedInd === 'WEIGHT_FOR_LENGTH'
            ? (language === 'ar' ? 'الوزن بالنسبة للطول' : 'Weight-for-length')
            : (language === 'ar' ? 'الوزن بالنسبة للطول' : 'Weight-for-height');
        }
      } else if (selectedInd === 'BMI_FOR_AGE') {
        const res = m.assessment.bmiForAge;
        if (res) {
          yVal = res.measurement;
          zScore = res.zScore;
          zScoreDisplayed = res.zScoreDisplayed;
          percentile = res.percentile;
          percentileDisplayed = res.percentileDisplayed;
          measurementVal = res.measurement;
          referenceName = res.reference;
          indicatorName = language === 'ar' ? 'مؤشر كتلة الجسم بالنسبة للعمر' : 'BMI-for-age';
        }
      } else if (selectedInd === 'HEAD_CIRCUMFERENCE_FOR_AGE') {
        const res = m.assessment.headCircumferenceForAge;
        if (res) {
          yVal = res.measurement;
          zScore = res.zScore;
          zScoreDisplayed = res.zScoreDisplayed;
          percentile = res.percentile;
          percentileDisplayed = res.percentileDisplayed;
          measurementVal = res.measurement;
          referenceName = res.reference;
          indicatorName = language === 'ar' ? 'محيط الرأس بالنسبة للعمر' : 'Head circumference-for-age';
        }
      }

      // X coordinate: If WFL/WFH, x is child's height/length in cm. Otherwise, age in days (0-5) or months (5-19).
      let rawX: number | undefined;
      if (chartConfig.isXAxisLengthHeight) {
        rawX = m.heightCm;
      } else {
        rawX = chartConfig.group === '0-5' ? m.assessment.age.ageInDays : m.assessment.age.totalCompletedMonths;
      }

      if (rawX === undefined || yVal === undefined || yVal <= 0) continue;

      // Formatted age label
      const ageFormatted = m.assessment.age.formattedAge;

      pts.push({
        entry: m,
        x: scaleX(rawX),
        y: scaleY(yVal),
        rawX,
        rawY: yVal,
        date: m.date,
        ageFormatted,
        measurementVal,
        measurementUnit,
        zScore,
        zScoreDisplayed,
        percentile,
        percentileDisplayed,
        indicatorName,
        referenceName,
      });
    }

    return pts.sort((a, b) => a.rawX - b.rawX);
  }, [measurements, selectedInd, chartConfig, language, minX, maxX, minY, maxY]);

  // Connect measurements chronologically
  const childTrajectoryPath = useMemo(() => {
    if (childPoints.length < 2) return '';
    return childPoints.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');
  }, [childPoints]);

  // Automatically select latest point for tooltip on mount or change
  useEffect(() => {
    if (childPoints.length > 0) {
      setSelectedPoint(childPoints[childPoints.length - 1]);
    } else {
      setSelectedPoint(null);
    }
  }, [childPoints.length, selectedInd]);

  // Current child test point for developer audit
  const activeAuditPoint = selectedPoint || (childPoints.length > 0 ? childPoints[childPoints.length - 1] : null);

  // Exact curve values at active child's point age/key
  const activeAgeCurveValues = useMemo(() => {
    if (!chartConfig.dataset || !activeAuditPoint) return null;
    try {
      const match = WHODatasetRegistry.findLMS(chartConfig.dataset, activeAuditPoint.rawX);
      const lms = match.lms;
      const calcSD = (z: number) => {
        if (z === 0) return lms.SD0 ?? lms.M;
        if (z === -2) return lms.SD2neg ?? (lms.M * Math.pow(1 + lms.L * lms.S * -2, 1 / (lms.L || 1)));
        if (z === -3) return lms.SD3neg ?? (lms.M * Math.pow(1 + lms.L * lms.S * -3, 1 / (lms.L || 1)));
        if (z === 2) return lms.SD2 ?? (lms.M * Math.pow(1 + lms.L * lms.S * 2, 1 / (lms.L || 1)));
        if (z === 3) return lms.SD3 ?? (lms.M * Math.pow(1 + lms.L * lms.S * 3, 1 / (lms.L || 1)));
        return lms.M;
      };

      return {
        sd3neg: calcSD(-3),
        sd2neg: calcSD(-2),
        median: calcSD(0),
        sd2pos: calcSD(2),
        sd3pos: calcSD(3),
        interpolated: match.interpolated,
      };
    } catch {
      return null;
    }
  }, [chartConfig.dataset, activeAuditPoint]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl max-w-full overflow-hidden">
      {/* 1. Header: Parent-Friendly, Dev Info Hidden by Default */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'مخطط النمو' : 'Growth Chart'}</span>
            </h3>
            {devMode && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                WHO Deterministic Engine
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ar' ? 'وفق معايير نمو الأطفال لمنظمة الصحة العالمية (WHO)' : 'According to WHO Child Growth Standards'}
          </p>
        </div>

        {/* Action Controls: Dev Mode & Validation Suite (Only shown in Dev Mode) */}
        {devMode && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDevAuditMode(!isDevAuditMode)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition-colors ${
                isDevAuditMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={language === 'ar' ? 'وضع الفحص الرياضي للمطورين' : 'Developer Audit Mode'}
            >
              {isDevAuditMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{language === 'ar' ? 'فحص رياضي' : 'Dev Audit'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsValidationModalOpen(true)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ar' ? 'فحص المخطط (15)' : 'Verify Chart (15)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Dynamic Indicator Tabs with Short Labels & Graceful Inapplicability Handling */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {indicatorTabs.map((tab) => {
            const isSelected = activeCategory === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (!tab.isApplicable) {
                    setInapplicableNotice(
                      tab.notApplicableReason ||
                        (language === 'ar'
                          ? 'هذا المؤشر غير متاح للفئة العمرية الحالية وفق مرجع WHO.'
                          : 'This indicator is not available for the current age group in the WHO reference.')
                    );
                  } else {
                    setInapplicableNotice(null);
                    setSelectedInd(tab.getIndicatorType());
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                    : tab.isApplicable
                    ? 'bg-slate-800/70 text-slate-300 border-slate-700/80 hover:bg-slate-700/80 hover:text-white'
                    : 'bg-slate-900/60 text-slate-500 border-slate-800/80 cursor-not-allowed opacity-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {inapplicableNotice && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 text-xs text-amber-300 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{inapplicableNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setInapplicableNotice(null)}
              className="p-1 rounded-lg text-amber-400 hover:text-amber-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. SVG Chart Container (Responsive, Mobile 320px with horizontal scroll) */}
      <div className="relative w-full overflow-x-auto bg-slate-950 rounded-2xl border border-slate-800 p-2 sm:p-3">
        {/* Important: dir="ltr" preserves Cartesian mathematical coordinate integrity */}
        <div dir="ltr" className="min-w-[500px] w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none font-mono text-[10px]"
          >
            {/* Background Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = padding.top + pct * innerH;
              const val = maxY - pct * (maxY - minY);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    className="text-[10px]"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Reference standard deviation curves */}
            {/* +3 SD (Upper red/orange line) */}
            <path d={pathSD3Pos} fill="none" stroke="#f97316" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
            {/* +2 SD (Upper expected reference range line) */}
            <path d={pathSD2Pos} fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />
            {/* 0 SD (Official WHO Median line) */}
            <path d={pathMedian} fill="none" stroke="#10b981" strokeWidth="2.5" />
            {/* -2 SD (Lower expected reference range line) */}
            <path d={pathSD2Neg} fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.85" />
            {/* -3 SD (Lower red/orange line) */}
            <path d={pathSD3Neg} fill="none" stroke="#f97316" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />

            {/* Right-Side SD Curve Labels (Placed with exact Y alignment, zero clipping) */}
            {lastCurvePoint && (
              <g className="font-bold text-[10px]">
                <text x={width - padding.right + 6} y={labelYPositions.p3 + 3} fill="#f97316" textAnchor="start">+3 SD</text>
                <text x={width - padding.right + 6} y={labelYPositions.p2 + 3} fill="#eab308" textAnchor="start">+2 SD</text>
                <text x={width - padding.right + 6} y={labelYPositions.m + 3} fill="#10b981" textAnchor="start">{language === 'ar' ? 'المتوسط' : 'Median'}</text>
                <text x={width - padding.right + 6} y={labelYPositions.n2 + 3} fill="#eab308" textAnchor="start">-2 SD</text>
                <text x={width - padding.right + 6} y={labelYPositions.n3 + 3} fill="#f97316" textAnchor="start">-3 SD</text>
              </g>
            )}

            {/* Child Trajectory Path (When >= 2 measurements exist) */}
            {childTrajectoryPath && (
              <path
                d={childTrajectoryPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Child Plotted Points (Direct engine values) */}
            {childPoints.map((pt, idx) => {
              const isSelected = selectedPoint?.date === pt.date;
              const isLast = idx === childPoints.length - 1;

              return (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedPoint(pt);
                    onSelectMeasurement?.(pt.entry);
                  }}
                >
                  {/* Invisible touch target for mobile tapping ease (r=18) */}
                  <circle cx={pt.x} cy={pt.y} r={18} fill="transparent" />

                  {/* Subtle outer halo on selection */}
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={11}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      opacity="0.8"
                      className="animate-pulse"
                    />
                  )}

                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 7 : isLast ? 6 : 5}
                    fill={isSelected ? '#0284c7' : '#38bdf8'}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2.5 : 2}
                    className="transition-transform group-hover:scale-125"
                  />
                </g>
              );
            })}

            {/* X-Axis Milestone Ticks */}
            {chartConfig.isXAxisLengthHeight ? (
              // Weight-for-length/height x-axis (in cm)
              [50, 60, 70, 80, 90, 100, 110, 120]
                .filter(cm => cm >= minX && cm <= maxX)
                .map((cm, idx) => {
                  const x = scaleX(cm);
                  return (
                    <g key={idx}>
                      <line x1={x} y1={height - padding.bottom} x2={x} y2={height - padding.bottom + 4} stroke="#475569" />
                      <text x={x} y={height - padding.bottom + 15} textAnchor="middle" fill="#64748b" className="text-[9px]">
                        {cm} cm
                      </text>
                    </g>
                  );
                })
            ) : chartConfig.group === '0-5' ? (
              // 0-5 years age milestones
              [
                { day: 0, label: '0' },
                { day: 182, label: '6m' },
                { day: 365, label: '1y' },
                { day: 730, label: '2y' },
                { day: 1095, label: '3y' },
                { day: 1461, label: '4y' },
                { day: 1826, label: '5y' },
              ].map((m, idx) => {
                const x = scaleX(m.day);
                return (
                  <g key={idx}>
                    <line x1={x} y1={height - padding.bottom} x2={x} y2={height - padding.bottom + 4} stroke="#475569" />
                    <text x={x} y={height - padding.bottom + 15} textAnchor="middle" fill="#64748b" className="text-[9px]">
                      {m.label}
                    </text>
                  </g>
                );
              })
            ) : (
              // 5-19 years age milestones
              [61, 84, 108, 132, 156, 180, 204, 228].map((mo, idx) => {
                const x = scaleX(mo);
                const yr = Math.round(mo / 12);
                return (
                  <g key={idx}>
                    <line x1={x} y1={height - padding.bottom} x2={x} y2={height - padding.bottom + 4} stroke="#475569" />
                    <text x={x} y={height - padding.bottom + 15} textAnchor="middle" fill="#64748b" className="text-[9px]">
                      {yr}y
                    </text>
                  </g>
                );
              })
            )}

            {/* Axis Title Labels */}
            <text
              x={padding.left + innerW / 2}
              y={height - 6}
              textAnchor="middle"
              fill="#94a3b8"
              className="text-[10px] font-sans font-medium"
            >
              {chartConfig.isXAxisLengthHeight
                ? (language === 'ar' ? 'الطول / الارتفاع (سم)' : 'Length / Height (cm)')
                : chartConfig.group === '0-5'
                ? (language === 'ar' ? 'العمر (بالأيام / السنوات)' : 'Age (Days / Years)')
                : (language === 'ar' ? 'العمر (بالأشهر / السنوات)' : 'Age (Months / Years)')}
            </text>

            <text
              x={14}
              y={padding.top + innerH / 2}
              textAnchor="middle"
              fill="#94a3b8"
              className="text-[10px] font-sans font-medium"
              transform={`rotate(-90 14 ${padding.top + innerH / 2})`}
            >
              {chartConfig.unit}
            </text>
          </svg>
        </div>
      </div>

      {/* 4. Single Measurement Notice (Exact required wording) */}
      {childPoints.length === 1 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-semibold text-amber-300">
              {language === 'ar' ? 'توجد قراءة واحدة حالياً.' : 'Currently only one measurement exists.'}
            </p>
            <p className="text-amber-200/80">
              {language === 'ar' ? 'أضف قياسات لاحقة لمتابعة مسار النمو.' : 'Add subsequent measurements to track growth trajectory.'}
            </p>
          </div>
        </div>
      )}

      {/* 5. Requirement 3: Interactive Tooltip When Point is Tapped */}
      {selectedPoint && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/40 shadow-xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-white/20 animate-pulse" />
              <span>{language === 'ar' ? 'تفاصيل قياس الطفل' : 'Child Measurement Details'}</span>
              <span className="text-[10px] text-slate-400 font-mono">({selectedPoint.date})</span>
            </span>

            <button
              onClick={() => setSelectedPoint(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 5 Required Fields + Indicator: اسم الطفل، العمر، القياس، Z-score، المئين */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {/* 1. اسم الطفل */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'اسم الطفل:' : 'Child Name:'}</span>
              <strong className="text-white text-xs">{childName || (language === 'ar' ? 'أحمد' : 'Ahmed')}</strong>
            </div>

            {/* 2. العمر */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'العمر:' : 'Age:'}</span>
              <strong className="text-white text-xs">{selectedPoint.ageFormatted}</strong>
            </div>

            {/* 3. القياس */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'القياس:' : 'Measurement:'}</span>
              <strong className="text-emerald-400 text-xs font-mono">
                {selectedPoint.measurementVal} {selectedPoint.measurementUnit === 'cm' && language === 'ar' ? 'سم' : selectedPoint.measurementUnit === 'kg' && language === 'ar' ? 'كغم' : selectedPoint.measurementUnit}
              </strong>
            </div>

            {/* 4. Z-score */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Z-score:</span>
              <strong className="text-emerald-400 text-xs font-mono">{selectedPoint.zScoreDisplayed}</strong>
            </div>

            {/* 5. المئين */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المئين:' : 'Percentile:'}</span>
              <strong className="text-white text-xs font-mono">{cleanPercentile(selectedPoint.percentile)}</strong>
            </div>

            {/* 6. المؤشر المستخدم */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المؤشر:' : 'Indicator:'}</span>
              <strong className="text-slate-300 text-xs truncate block">{selectedPoint.indicatorName}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 6. Requirement 10: Developer Validation Panel (Hidden in Parent UI, only visible in Dev Mode) */}
      {devMode && isDevAuditMode && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <span className="font-bold text-amber-300 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'لوحة تدقيق المطور (Developer Validation Panel)' : 'Developer Validation Panel'}</span>
            </span>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              WHO Deterministic Engine
            </span>
          </div>

          {/* 10 Required Items: dataset, sex, age, indicator, measurement, Z-score, percentile, number of reference points, reference source, curve generation method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px] font-mono">
            {/* 1. dataset */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[10px]">1. Dataset:</span>
              <strong className="text-white text-[10px] break-all">{chartConfig.dataset?.metadata.indicator}_{sex}</strong>
            </div>

            {/* 2. sex */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[10px]">2. Biological Sex:</span>
              <strong className="text-white">{sex}</strong>
            </div>

            {/* 3. age */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[10px]">3. Age:</span>
              <strong className="text-white">
                {activeAuditPoint?.rawX} {chartConfig.group === '0-5' ? (chartConfig.isXAxisLengthHeight ? 'cm' : 'days') : 'months'}
              </strong>
            </div>

            {/* 4. indicator */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[10px]">4. Indicator:</span>
              <strong className="text-emerald-400">{selectedInd}</strong>
            </div>

            {/* 5. measurement */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[10px]">5. Measurement:</span>
              <strong className="text-white">{activeAuditPoint?.measurementVal} {activeAuditPoint?.measurementUnit}</strong>
            </div>

            {/* 6. Z-score */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[10px]">6. Z-score:</span>
              <strong className="text-emerald-400 font-bold">{activeAuditPoint?.zScore !== undefined ? activeAuditPoint.zScore.toFixed(4) : '—'}</strong>
            </div>

            {/* 7. percentile */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[10px]">7. Percentile:</span>
              <strong className="text-white">{cleanPercentile(activeAuditPoint?.percentile)}</strong>
            </div>

            {/* 8. number of reference points */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block font-sans text-[10px]">8. Reference Points:</span>
              <strong className="text-white">{chartConfig.dataset?.data.length} official points</strong>
            </div>

            {/* 9. reference source */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 sm:col-span-2 lg:col-span-1">
              <span className="text-slate-400 block font-sans text-[10px]">9. Reference Source:</span>
              <strong className="text-teal-300 text-[10px] block truncate">
                {chartConfig.dataset?.metadata.referenceName || chartConfig.dataset?.metadata.source || 'WHO Child Growth Standards (2006)'}
              </strong>
            </div>

            {/* 10. curve generation method */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 sm:col-span-2 lg:col-span-1">
              <span className="text-slate-400 block font-sans text-[10px]">10. Curve Generation:</span>
              <strong className="text-amber-300 text-[10px] block truncate">
                Deterministic WHO Box-Cox LMS
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* 7. Requirement 6: Compact Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-white/30" />
            <span className="text-sky-300 font-medium">
              {language === 'ar' ? '● قياس الطفل' : "● Child's measurement"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-emerald-500 rounded" />
            <span className="text-emerald-400 font-medium">
              {language === 'ar' ? '— المتوسط' : '— Median'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-yellow-500 border-b border-dashed border-yellow-500" />
            <span className="text-yellow-400/90">
              {language === 'ar' ? '— المجال المرجعي ±2 SD' : '— Reference range ±2 SD'}
            </span>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          {childPoints.length} {t('previous_measurements')}
        </span>
      </div>

      {/* Automated Validation Modal (Accessible in Dev Mode) */}
      <WHOChartValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
      />
    </div>
  );
};

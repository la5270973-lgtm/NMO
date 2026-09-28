/**
 * NMO | نمو — Child Growth Application
 * Phase 4: Parent-Facing Child Growth Analysis Screen
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 * 
 * STRICT RULES:
 * 1. Consumes deterministic outputs directly from WHOGrowthEngine & GrowthStatusEngine.
 * 2. Z-scores and percentiles are NEVER recalculated independently in the UI.
 * 3. Does not diagnose disease; uses non-diagnostic WHO phrasing: "ضمن المتوقع".
 * 4. Full RTL Arabic default with complete English translation.
 * 5. Minimum width 320px, responsive, no horizontal overflow.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { ChildProfile, MeasurementEntry } from '../types/child.ts';
import { GrowthStatusEngineOutput } from '../types/growthStatus.ts';
import { GrowthChart } from './GrowthChart.tsx';
import { GrowthReportModal } from './GrowthReportModal.tsx';
import { cleanPercentile, roundPresentationNumber } from '../i18n/formatters.ts';
import {
  Activity,
  FileText,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Info,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface GrowthAnalysisScreenProps {
  child: ChildProfile;
  latestMeasurement: MeasurementEntry | null;
  allMeasurements: MeasurementEntry[];
  growthStatusOutput: GrowthStatusEngineOutput | null;
  onNavigateToDoctorWithMessage: (prefilledAttachmentText: string) => void;
  onOpenAddMeasurement: () => void;
  onOpenChartValidation?: () => void;
  onOpenEngineValidation?: () => void;
}

export const GrowthAnalysisScreen: React.FC<GrowthAnalysisScreenProps> = ({
  child,
  latestMeasurement,
  allMeasurements,
  growthStatusOutput,
  onNavigateToDoctorWithMessage,
  onOpenAddMeasurement,
  onOpenChartValidation,
  onOpenEngineValidation,
}) => {
  const {
    t,
    language,
    isRTL,
    formatDate,
    formatAge,
    formatHeightVal,
    formatWeightVal,
    formatHCVal,
    formatBMIVal,
  } = useTranslation();

  // State for Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);

  // State for Medical Disclaimer progressive disclosure
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false);

  // Safe assessment accessor
  const assessment = latestMeasurement?.assessment;

  // Helper for Z-score formatting (+0.06, -0.45)
  const formatZ = (z?: number) => {
    if (z === undefined || isNaN(z)) return '—';
    const rounded = roundPresentationNumber(z, 2);
    return z > 0 ? `+${rounded}` : rounded;
  };

  // Structured summary builder for doctor contact
  const structuredDoctorSummary = useMemo(() => {
    if (!latestMeasurement || !assessment) return '';
    const ageStr = formatAge(assessment.age);
    const dateStr = formatDate(latestMeasurement.date);
    const sexStr = child.sex === 'male' ? (language === 'ar' ? 'ذكر' : 'Male') : (language === 'ar' ? 'أنثى' : 'Female');
    const statusStr = growthStatusOutput?.overallStatus || (language === 'ar' ? 'ضمن المتوقع' : 'Within Expected Range');

    if (language === 'ar') {
      return (
        `📋 ملخص نمو الطفل:\n` +
        `• اسم الطفل: ${child.name}\n` +
        `• العمر: ${ageStr}\n` +
        `• الجنس: ${sexStr}\n` +
        `• تاريخ القياس: ${dateStr}\n` +
        `• الطول بالنسبة للعمر: ${formatHeightVal(latestMeasurement.heightCm)} (Z-score: ${formatZ(assessment.heightLength?.zScore)}، المئين: ${cleanPercentile(assessment.heightLength?.percentile)})\n` +
        `• الوزن بالنسبة للعمر: ${formatWeightVal(latestMeasurement.weightKg)} (Z-score: ${formatZ(assessment.weightForAge?.zScore)}، المئين: ${cleanPercentile(assessment.weightForAge?.percentile)})\n` +
        `• الوزن بالنسبة للطول: ${formatWeightVal(latestMeasurement.weightKg)} (Z-score: ${formatZ(assessment.weightForLengthOrHeight?.zScore)}، المئين: ${cleanPercentile(assessment.weightForLengthOrHeight?.percentile)})\n` +
        `• مؤشر كتلة الجسم (BMI): ${formatBMIVal(assessment.calculatedBMI)} (Z-score: ${formatZ(assessment.bmiForAge?.zScore)}، المئين: ${cleanPercentile(assessment.bmiForAge?.percentile)})\n` +
        `• محيط الرأس بالنسبة للعمر: ${formatHCVal(latestMeasurement.headCircumferenceCm)} (Z-score: ${formatZ(assessment.headCircumferenceForAge?.zScore)}، المئين: ${cleanPercentile(assessment.headCircumferenceForAge?.percentile)})\n` +
        `• حالة النمو: ${statusStr} (قياسات النمو الحالية تقع ضمن النطاق المتوقع وفق مرجع النمو المستخدم.)`
      );
    } else {
      return (
        `📋 Child Growth Summary:\n` +
        `• Child Name: ${child.name}\n` +
        `• Age: ${ageStr}\n` +
        `• Sex: ${sexStr}\n` +
        `• Measurement Date: ${dateStr}\n` +
        `• Height-for-age: ${formatHeightVal(latestMeasurement.heightCm)} (Z-score: ${formatZ(assessment.heightLength?.zScore)}, Percentile: ${cleanPercentile(assessment.heightLength?.percentile)})\n` +
        `• Weight-for-age: ${formatWeightVal(latestMeasurement.weightKg)} (Z-score: ${formatZ(assessment.weightForAge?.zScore)}, Percentile: ${cleanPercentile(assessment.weightForAge?.percentile)})\n` +
        `• Weight-for-height: ${formatWeightVal(latestMeasurement.weightKg)} (Z-score: ${formatZ(assessment.weightForLengthOrHeight?.zScore)}, Percentile: ${cleanPercentile(assessment.weightForLengthOrHeight?.percentile)})\n` +
        `• BMI-for-age: ${formatBMIVal(assessment.calculatedBMI)} (Z-score: ${formatZ(assessment.bmiForAge?.zScore)}, Percentile: ${cleanPercentile(assessment.bmiForAge?.percentile)})\n` +
        `• Head circumference-for-age: ${formatHCVal(latestMeasurement.headCircumferenceCm)} (Z-score: ${formatZ(assessment.headCircumferenceForAge?.zScore)}, Percentile: ${cleanPercentile(assessment.headCircumferenceForAge?.percentile)})\n` +
        `• Growth Status: ${statusStr} (Current growth measurements are within the expected range of the selected growth reference.)`
      );
    }
  }, [child, latestMeasurement, assessment, growthStatusOutput, language, formatAge, formatDate, formatHeightVal, formatWeightVal, formatHCVal, formatBMIVal]);

  const handleMessageDoctorClick = () => {
    onNavigateToDoctorWithMessage(structuredDoctorSummary);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ============================================================== */}
      {/* 1. PAGE HEADER                                                  */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase font-mono">
                {t('brand_tagline')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {language === 'ar' ? `تحليل نمو ${child.name}` : `Growth Analysis for ${child.name}`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {t('growth_analysis_subtitle')}
            </p>

            {/* Child Demographics Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('child_name')}: <strong className="text-white">{child.name}</strong></span>
              </div>

              {assessment && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('age')}: <strong className="text-white">{formatAge(assessment.age)}</strong></span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                <span>{t('sex')}: <strong className="text-white">{child.sex === 'male' ? t('sex_male') : t('sex_female')}</strong></span>
              </div>

              {latestMeasurement && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('latest_measurement')}: <strong className="text-white font-mono">{formatDate(latestMeasurement.date)}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs in Header */}
          <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-2.5 shrink-0 pt-2 md:pt-0">
            {/* [ إنشاء تقرير النمو ] */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{t('create_growth_report')}</span>
            </button>

            {/* [ مراسلة الطبيب ] */}
            <button
              onClick={handleMessageDoctorClick}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t('nav_message_doctor')}</span>
            </button>

            {/* Validation tools triggers (secondary) */}
            {(onOpenChartValidation || onOpenEngineValidation) && (
              <div className="flex items-center gap-1.5 pt-1">
                {onOpenChartValidation && (
                  <button
                    onClick={onOpenChartValidation}
                    className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-[10px] text-emerald-400 border border-slate-800 transition-colors text-center"
                    title={language === 'ar' ? 'فحص المخطط (15 اختبار)' : 'Verify Chart (15 Tests)'}
                  >
                    {language === 'ar' ? 'فحص المخطط' : 'Verify Chart'}
                  </button>
                )}
                {onOpenEngineValidation && (
                  <button
                    onClick={onOpenEngineValidation}
                    className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-[10px] text-teal-400 border border-slate-800 transition-colors text-center"
                    title={language === 'ar' ? 'فحص المحرك (28 اختبار)' : 'Verify Engine (28 Tests)'}
                  >
                    {language === 'ar' ? 'فحص المحرك' : 'Verify Engine'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ambient subtle background glow */}
        <div className="absolute -left-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ============================================================== */}
      {/* 2. CURRENT GROWTH STATUS                                        */}
      {/* ============================================================== */}
      <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 space-y-2 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <h2 className="text-base sm:text-lg font-black text-emerald-300">
            {growthStatusOutput?.overallStatus || (language === 'ar' ? 'ضمن المتوقع' : 'Within Expected Range')}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed ps-5.5">
          {growthStatusOutput?.parentExplanation || t('growth_status_within_expected_desc')}
        </p>
      </section>

      {/* ============================================================== */}
      {/* 3. SUMMARY CARDS (All 5 WHO indicators from Growth Engine)     */}
      {/* ============================================================== */}
      {assessment && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'بطاقات قياسات النمو الحالية' : 'Current Growth Measurement Cards'}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              WHO Child Growth Standards
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* 1. الطول بالنسبة للعمر */}
            {assessment.heightLength && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    {t('ind_height_for_age')}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono pt-1">
                    {formatHeightVal(latestMeasurement?.heightCm)}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400 text-[11px]">Z-score:</span>
                    <strong className="text-emerald-400 font-bold">
                      {formatZ(assessment.heightLength.zScore)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">
                      {language === 'ar' ? 'المئين:' : 'Percentile:'}
                    </span>
                    <strong className="text-slate-200 font-mono font-bold">
                      {cleanPercentile(assessment.heightLength.percentile)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* 2. الوزن بالنسبة للعمر */}
            {assessment.weightForAge && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    {t('ind_weight_for_age')}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono pt-1">
                    {formatWeightVal(latestMeasurement?.weightKg)}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400 text-[11px]">Z-score:</span>
                    <strong className="text-emerald-400 font-bold">
                      {formatZ(assessment.weightForAge.zScore)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">
                      {language === 'ar' ? 'المئين:' : 'Percentile:'}
                    </span>
                    <strong className="text-slate-200 font-mono font-bold">
                      {cleanPercentile(assessment.weightForAge.percentile)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* 3. الوزن بالنسبة للطول */}
            {assessment.weightForLengthOrHeight && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    {t('ind_weight_for_height')}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono pt-1">
                    {formatWeightVal(latestMeasurement?.weightKg)}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400 text-[11px]">Z-score:</span>
                    <strong className="text-emerald-400 font-bold">
                      {formatZ(assessment.weightForLengthOrHeight.zScore)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">
                      {language === 'ar' ? 'المئين:' : 'Percentile:'}
                    </span>
                    <strong className="text-slate-200 font-mono font-bold">
                      {cleanPercentile(assessment.weightForLengthOrHeight.percentile)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* 4. مؤشر كتلة الجسم بالنسبة للعمر */}
            {assessment.bmiForAge && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    {t('ind_bmi_for_age')}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono pt-1">
                    {formatBMIVal(assessment.calculatedBMI)}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400 text-[11px]">Z-score:</span>
                    <strong className="text-emerald-400 font-bold">
                      {formatZ(assessment.bmiForAge.zScore)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">
                      {language === 'ar' ? 'المئين:' : 'Percentile:'}
                    </span>
                    <strong className="text-slate-200 font-mono font-bold">
                      {cleanPercentile(assessment.bmiForAge.percentile)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* 5. محيط الرأس بالنسبة للعمر */}
            {assessment.headCircumferenceForAge && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    {t('ind_head_circumference_for_age')}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono pt-1">
                    {formatHCVal(latestMeasurement?.headCircumferenceCm)}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400 text-[11px]">Z-score:</span>
                    <strong className="text-emerald-400 font-bold">
                      {formatZ(assessment.headCircumferenceForAge.zScore)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">
                      {language === 'ar' ? 'المئين:' : 'Percentile:'}
                    </span>
                    <strong className="text-slate-200 font-mono font-bold">
                      {cleanPercentile(assessment.headCircumferenceForAge.percentile)}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 4. SIMPLE PARENT EXPLANATION ("ماذا تعني هذه الأرقام؟")          */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <span>{t('what_numbers_mean_title')}</span>
        </h2>

        <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed ps-1">
          <p className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span>{t('percentile_explanation')}</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span>{t('zscore_explanation')}</span>
          </p>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. GROWTH CHART (Interactive WHO Growth Chart)                  */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <GrowthChart
          childName={child.name}
          sex={child.sex}
          measurements={allMeasurements}
          currentIndicator="HEIGHT_FOR_AGE"
          dateOfBirth={child.dateOfBirth}
          devMode={false}
        />
      </section>

      {/* ============================================================== */}
      {/* 6. CHILD TRAJECTORY ("مسار النمو")                             */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ar' ? 'مسار النمو' : 'Growth Trajectory'}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {allMeasurements.length} {language === 'ar' ? 'قياسات مسجلة' : 'records'}
          </span>
        </div>

        {allMeasurements.length > 1 ? (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('trajectory_multi_explanation')}
            </p>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left rtl:text-right text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">{t('measurement_date')}</th>
                    <th className="py-2.5 px-3">{t('height')}</th>
                    <th className="py-2.5 px-3">{t('weight')}</th>
                    <th className="py-2.5 px-3">{t('bmi')}</th>
                    <th className="py-2.5 px-3">Z-score (HAZ)</th>
                    <th className="py-2.5 px-3">{t('percentile')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {allMeasurements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-sans font-bold text-white">{formatDate(m.date)}</td>
                      <td className="py-2.5 px-3">{formatHeightVal(m.heightCm)}</td>
                      <td className="py-2.5 px-3">{formatWeightVal(m.weightKg)}</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {m.assessment?.calculatedBMI ? formatBMIVal(m.assessment.calculatedBMI) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">
                        {formatZ(m.assessment?.heightLength?.zScore)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">
                        {cleanPercentile(m.assessment?.heightLength?.percentile)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs sm:text-sm text-slate-300">
            <p className="font-semibold text-white">
              {t('trajectory_single_notice')}
            </p>
            <p className="text-slate-400">
              {t('trajectory_add_subsequent')}
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAddMeasurement}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition-colors"
              >
                + {t('add_measurement')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 7. WHAT TO WATCH ("ما الذي نتابعه؟")                            */}
      {/* ============================================================== */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>{t('what_we_watch_title')}</span>
        </h2>

        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed ps-1">
          <p className="flex items-start gap-2">
            <span className="text-teal-400 font-bold">•</span>
            <span>{t('what_we_watch_1')}</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-teal-400 font-bold">•</span>
            <span>{t('what_we_watch_2')}</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-teal-400 font-bold">•</span>
            <span>{t('what_we_watch_3')}</span>
          </p>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. DOCTOR CONTACT ("مراسلة الطبيب")                            */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-tr from-slate-900 via-slate-900 to-teal-950/30 border border-teal-500/30 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {t('nav_message_doctor')}
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'ar'
              ? 'يمكنك توجيه استفسارك مباشرة إلى الطبيب. عند الضغط سيتم إرفاق ملخص منظم بجميع قياسات ومؤشرات نمو طفلك تلقائياً لمساعدة الطبيب في الإجابة.'
              : 'You can ask your doctor directly. Clicking will automatically attach a structured summary of your child’s growth measurements to give your doctor clear context.'}
          </p>
        </div>

        <button
          onClick={handleMessageDoctorClick}
          className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Stethoscope className="w-4 h-4" />
          <span>{t('nav_message_doctor')}</span>
        </button>
      </section>

      {/* ============================================================== */}
      {/* 10. MEDICAL DISCLAIMER ("ملاحظة مهمة" - Small Expandable)       */}
      {/* ============================================================== */}
      <section className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 transition-all">
        <button
          onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400/80" />
            <span>{t('important_note_title')}</span>
          </div>
          {isDisclaimerExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isDisclaimerExpanded && (
          <div className="pt-2.5 mt-2 border-t border-slate-800/60 text-[11px] sm:text-xs text-slate-400 leading-relaxed animate-in fade-in duration-200">
            {t('important_note_text')}
          </div>
        )}
      </section>

      {/* Growth Report Modal */}
      <GrowthReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        child={child}
        latestMeasurement={latestMeasurement}
        allMeasurements={allMeasurements}
        growthStatusOutput={growthStatusOutput}
      />
    </div>
  );
};

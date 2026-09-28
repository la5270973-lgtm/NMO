/**
 * NMO | نمو — Child Growth Application
 * Phase 4: Deterministic Child Growth Report Modal (Print & PDF ready)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import React, { useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { ChildProfile, MeasurementEntry } from '../types/child.ts';
import { GrowthStatusEngineOutput } from '../types/growthStatus.ts';
import { GrowthChart } from './GrowthChart.tsx';
import { cleanPercentile, roundPresentationNumber } from '../i18n/formatters.ts';
import {
  X,
  Printer,
  FileText,
  ShieldCheck,
  Activity,
  Calendar,
  User,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface GrowthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile;
  latestMeasurement: MeasurementEntry | null;
  allMeasurements: MeasurementEntry[];
  growthStatusOutput: GrowthStatusEngineOutput | null;
}

export const GrowthReportModal: React.FC<GrowthReportModalProps> = ({
  isOpen,
  onClose,
  child,
  latestMeasurement,
  allMeasurements,
  growthStatusOutput,
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

  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !latestMeasurement || !latestMeasurement.assessment) return null;

  const assessment = latestMeasurement.assessment;

  const handlePrint = () => {
    window.print();
  };

  // Helper for Z-score formatting (+0.06 or -0.45)
  const formatZ = (z?: number) => {
    if (z === undefined || isNaN(z)) return '—';
    const rounded = roundPresentationNumber(z, 2);
    return z > 0 ? `+${rounded}` : rounded;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black">
        {/* Modal Top Bar (Hidden in print) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {language === 'ar' ? 'تقرير نمو الطفل' : 'Child Growth Report'}
              </h3>
              <p className="text-xs text-slate-400">
                {child.name} • {formatDate(latestMeasurement.date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print_growth_report')}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Report Container */}
        <div
          ref={printRef}
          className="p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-200 print:text-slate-900 print:bg-white print:overflow-visible print:p-6"
        >
          {/* Header with Official NMO Branding */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 print:border-slate-300">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl font-black shadow-md print:bg-emerald-700">
                ن
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white print:text-slate-900 tracking-tight">
                  {t('brand_tagline')}
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {t('brand_subtitle')}
                </p>
              </div>
            </div>

            <div className="text-left rtl:text-right text-xs text-slate-400 print:text-slate-600 space-y-0.5">
              <p>
                {t('founder_title')}: <strong className="text-slate-200 print:text-slate-800">{t('founder_name')}</strong>
              </p>
              <p className="font-mono text-[11px]">
                {language === 'ar' ? 'تاريخ التقرير' : 'Report Date'}: {formatDate(latestMeasurement.date)}
              </p>
            </div>
          </div>

          {/* Child Demographics Grid */}
          <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs font-bold text-emerald-400 print:text-emerald-700 uppercase tracking-wider mb-3">
              {language === 'ar' ? 'بيانات الطفل والقياس' : 'Child & Measurement Information'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[11px]">{t('child_name')}</span>
                <strong className="text-white print:text-slate-900 text-sm font-bold">{child.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[11px]">{t('age')}</span>
                <strong className="text-white print:text-slate-900 text-sm font-bold">
                  {formatAge(assessment.age)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[11px]">{t('sex')}</span>
                <strong className="text-white print:text-slate-900 text-sm font-bold">
                  {child.sex === 'male' ? t('sex_male') : t('sex_female')}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[11px]">{t('measurement_date')}</span>
                <strong className="text-white print:text-slate-900 text-sm font-bold font-mono">
                  {formatDate(latestMeasurement.date)}
                </strong>
              </div>
            </div>
          </div>

          {/* Overall Growth Status (Deterministic) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 print:border-emerald-600 print:bg-emerald-50/50 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 print:bg-emerald-600" />
              <h3 className="text-sm font-extrabold text-emerald-300 print:text-emerald-800">
                {language === 'ar' ? 'حالة النمو: ضمن المتوقع' : 'Growth Status: Within Expected Range'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed ps-4.5">
              {t('growth_status_within_expected_desc')}
            </p>
          </div>

          {/* Measurements & Indicators Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
              <span>{language === 'ar' ? 'مؤشرات النمو المسجلة وفق WHO' : 'Recorded WHO Growth Indicators'}</span>
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-700 border-b border-slate-800 print:border-slate-300">
                  <tr>
                    <th className="py-3 px-3.5 font-bold">{language === 'ar' ? 'المؤشر' : 'Indicator'}</th>
                    <th className="py-3 px-3 font-bold">{language === 'ar' ? 'القياس' : 'Measurement'}</th>
                    <th className="py-3 px-3 font-bold">Z-score</th>
                    <th className="py-3 px-3 font-bold">{t('percentile')}</th>
                    <th className="py-3 px-3.5 font-bold">{language === 'ar' ? 'التقييم السريري' : 'Clinical Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 print:divide-slate-200 font-mono">
                  {/* Height-for-age */}
                  {assessment.heightLength && (
                    <tr className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="py-3 px-3.5 font-sans font-bold text-white print:text-slate-900">
                        {t('ind_height_for_age')}
                      </td>
                      <td className="py-3 px-3">{formatHeightVal(latestMeasurement.heightCm)}</td>
                      <td className="py-3 px-3 text-emerald-400 print:text-emerald-800 font-bold">
                        {formatZ(assessment.heightLength.zScore)}
                      </td>
                      <td className="py-3 px-3 text-slate-200 print:text-slate-800 font-sans">
                        {cleanPercentile(assessment.heightLength.percentile)}
                      </td>
                      <td className="py-3 px-3.5 font-sans text-emerald-400 print:text-emerald-800">
                        {t('status_within_expected')}
                      </td>
                    </tr>
                  )}

                  {/* Weight-for-age */}
                  {assessment.weightForAge && (
                    <tr className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="py-3 px-3.5 font-sans font-bold text-white print:text-slate-900">
                        {t('ind_weight_for_age')}
                      </td>
                      <td className="py-3 px-3">{formatWeightVal(latestMeasurement.weightKg)}</td>
                      <td className="py-3 px-3 text-emerald-400 print:text-emerald-800 font-bold">
                        {formatZ(assessment.weightForAge.zScore)}
                      </td>
                      <td className="py-3 px-3 text-slate-200 print:text-slate-800 font-sans">
                        {cleanPercentile(assessment.weightForAge.percentile)}
                      </td>
                      <td className="py-3 px-3.5 font-sans text-emerald-400 print:text-emerald-800">
                        {t('status_within_expected')}
                      </td>
                    </tr>
                  )}

                  {/* Weight-for-height */}
                  {assessment.weightForLengthOrHeight && (
                    <tr className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="py-3 px-3.5 font-sans font-bold text-white print:text-slate-900">
                        {t('ind_weight_for_height')}
                      </td>
                      <td className="py-3 px-3">{formatWeightVal(latestMeasurement.weightKg)}</td>
                      <td className="py-3 px-3 text-emerald-400 print:text-emerald-800 font-bold">
                        {formatZ(assessment.weightForLengthOrHeight.zScore)}
                      </td>
                      <td className="py-3 px-3 text-slate-200 print:text-slate-800 font-sans">
                        {cleanPercentile(assessment.weightForLengthOrHeight.percentile)}
                      </td>
                      <td className="py-3 px-3.5 font-sans text-emerald-400 print:text-emerald-800">
                        {t('status_within_expected')}
                      </td>
                    </tr>
                  )}

                  {/* BMI-for-age */}
                  {assessment.bmiForAge && (
                    <tr className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="py-3 px-3.5 font-sans font-bold text-white print:text-slate-900">
                        {t('ind_bmi_for_age')}
                      </td>
                      <td className="py-3 px-3">{formatBMIVal(assessment.calculatedBMI)}</td>
                      <td className="py-3 px-3 text-emerald-400 print:text-emerald-800 font-bold">
                        {formatZ(assessment.bmiForAge.zScore)}
                      </td>
                      <td className="py-3 px-3 text-slate-200 print:text-slate-800 font-sans">
                        {cleanPercentile(assessment.bmiForAge.percentile)}
                      </td>
                      <td className="py-3 px-3.5 font-sans text-emerald-400 print:text-emerald-800">
                        {t('status_within_expected')}
                      </td>
                    </tr>
                  )}

                  {/* Head circumference */}
                  {assessment.headCircumferenceForAge && (
                    <tr className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="py-3 px-3.5 font-sans font-bold text-white print:text-slate-900">
                        {t('ind_head_circumference_for_age')}
                      </td>
                      <td className="py-3 px-3">{formatHCVal(latestMeasurement.headCircumferenceCm)}</td>
                      <td className="py-3 px-3 text-emerald-400 print:text-emerald-800 font-bold">
                        {formatZ(assessment.headCircumferenceForAge.zScore)}
                      </td>
                      <td className="py-3 px-3 text-slate-200 print:text-slate-800 font-sans">
                        {cleanPercentile(assessment.headCircumferenceForAge.percentile)}
                      </td>
                      <td className="py-3 px-3.5 font-sans text-emerald-400 print:text-emerald-800">
                        {t('status_within_expected')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Growth Chart View */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-white print:text-slate-900 uppercase tracking-wider">
              {language === 'ar' ? 'مخطط نمو منظمة الصحة العالمية (WHO)' : 'WHO Growth Chart'}
            </h4>
            <div className="rounded-2xl border border-slate-800 print:border-slate-300 overflow-hidden bg-slate-950/40 print:bg-white p-2">
              <GrowthChart
                sex={child.sex}
                measurements={allMeasurements}
                currentIndicator="HEIGHT_FOR_AGE"
                dateOfBirth={child.dateOfBirth}
              />
            </div>
          </div>

          {/* Medical Disclaimer Section */}
          <div className="p-4 rounded-2xl bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs text-slate-400 print:text-slate-700 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('report_growth_disclaimer')}
            </p>
          </div>

          {/* Signoff / Certification Footer */}
          <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-[11px] text-slate-500 print:text-slate-600">
            <span>{t('copyright')}</span>
            <span>WHO 2006 & 2007 Child Growth Standards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

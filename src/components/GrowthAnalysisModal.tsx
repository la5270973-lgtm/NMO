/**
 * NMO | نمو — Child Growth Application
 * Phase 2: Growth Analysis View & Doctor Inspection View
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 * Brand: نمو | NMO
 */

import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { ChildProfile, MeasurementEntry } from '../types/child.ts';
import { GrowthStatusEngineOutput } from '../types/growthStatus.ts';
import {
  X,
  Activity,
  Stethoscope,
  Info,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';

interface GrowthAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile;
  latestMeasurement: MeasurementEntry | null;
  growthStatusOutput: GrowthStatusEngineOutput | null;
  onNavigateToChart: () => void;
  onNavigateToDoctor: () => void;
}

export const GrowthAnalysisModal: React.FC<GrowthAnalysisModalProps> = ({
  isOpen,
  onClose,
  child,
  latestMeasurement,
  growthStatusOutput,
  onNavigateToChart,
  onNavigateToDoctor,
}) => {
  const {
    t,
    language,
    formatDate,
    formatHeightVal,
    formatWeightVal,
    formatHCVal,
    formatBMIVal,
    formatPercentile,
    cleanPercentileVal,
  } = useTranslation();

  const [activeTab, setActiveTab] = useState<'parent' | 'technical' | 'doctor'>('parent');
  const [showWhatMeansExplanation, setShowWhatMeansExplanation] = useState(false);

  if (!isOpen || !growthStatusOutput) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {language === 'ar' ? 'عرض تحليل النمو' : 'Growth Analysis Details'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${growthStatusOutput.badgeBg} ${growthStatusOutput.badgeText} border ${growthStatusOutput.badgeBorder}`}
                >
                  {growthStatusOutput.iconSymbol} {growthStatusOutput.overallStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {child.name} • {latestMeasurement ? formatDate(latestMeasurement.date) : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Switcher: Parent View / Technical Details / Doctor View */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 sm:px-6 shrink-0 text-xs font-semibold gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('parent')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'parent'
                ? 'border-emerald-400 text-emerald-400 font-bold bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تحليل الأهل' : 'Parent View'}</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'technical'
                ? 'border-emerald-400 text-emerald-400 font-bold bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'التفاصيل التقنية' : 'Technical Details'}</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'doctor'
                ? 'border-emerald-400 text-emerald-400 font-bold bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'طريقة عرض الطبيب' : 'Doctor View'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* ============================================================== */}
          {/* VIEW 1: PARENT-FACING EXPLANATION VIEW (Section 14 & 15)       */}
          {/* ============================================================== */}
          {activeTab === 'parent' && (
            <div className="space-y-4">
              {/* Primary Status Card with Safe WHO Phrasing */}
              <div
                className={`p-5 rounded-3xl border ${growthStatusOutput.badgeBg} ${growthStatusOutput.badgeBorder} space-y-2`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{growthStatusOutput.iconSymbol}</span>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      {language === 'ar' ? 'الحالة الإجمالية' : 'Overall Status'}
                    </span>
                    <strong className={`text-base font-bold ${growthStatusOutput.badgeText}`}>
                      {growthStatusOutput.overallStatus}
                    </strong>
                  </div>
                </div>
                {/* Standard Safe Pediatric Explanation (Section 10) */}
                <p className="text-xs text-slate-200 leading-relaxed pt-1">
                  "{growthStatusOutput.parentExplanation}"
                </p>
              </div>

              {/* Longitudinal Trajectory Card (Section 12) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('growth_trend_label')}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-emerald-400">
                    {language === 'ar'
                      ? growthStatusOutput.trend.trendLabelAr
                      : growthStatusOutput.trend.trendLabelEn}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? growthStatusOutput.trend.explanationAr
                    : growthStatusOutput.trend.explanationEn}
                </p>
              </div>

              {/* Indicator by Indicator Breakdown List (Section 14) */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'ar' ? 'مؤشرات النمو المطبقة' : 'Applicable Growth Indicators'}</span>
                </h4>

                <div className="space-y-2">
                  {growthStatusOutput.applicableIndicatorsList.map((ind) => (
                    <div
                      key={ind.indicator}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-xs font-semibold">
                            {language === 'ar' ? ind.indicatorNameAr : ind.indicatorNameEn}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({ind.measurementValue} {ind.measurementUnit})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {language === 'ar' ? ind.parentExplanationAr : ind.parentExplanationEn}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-right rtl:text-left font-mono shrink-0">
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                          Z: {ind.zScoreDisplayed}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-[11px]">
                          {formatPercentile(ind.percentile)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* "ماذا تعني هذه النتائج؟" Collapsible Section */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowWhatMeansExplanation(!showWhatMeansExplanation)}
                  className="w-full p-3.5 text-left rtl:text-right flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'ar' ? 'ماذا تعني هذه النتائج؟' : 'What do these results mean?'}</span>
                  </span>
                  {showWhatMeansExplanation ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showWhatMeansExplanation && (
                  <div className="p-4 pt-1 space-y-2 text-[11px] text-slate-300 border-t border-slate-800/60 leading-relaxed bg-slate-900/40">
                    <p>
                      •{' '}
                      {language === 'ar'
                        ? 'الدرجة المعيارية (Z-score) توضح بعد قياس طفلك عن الوسيط لأطفال أصحاء من نفس العمر والجنس وفق معايير منظمة الصحة العالمية.'
                        : 'The Z-score measures how far a child’s measurement is from the median of healthy children of the same age and sex according to WHO standards.'}
                    </p>
                    <p>
                      •{' '}
                      {language === 'ar'
                        ? 'المئين (Percentile) يوضح نسبة الأطفال الذين تقع قياساتهم تحت هذا الرقم. المئين 50 يمثل الوسيط المتزن تماماً.'
                        : 'The percentile indicates the percentage of children below this value. The 50th percentile represents the balanced median.'}
                    </p>
                    <p className="text-slate-400">
                      •{' '}
                      {language === 'ar'
                        ? 'هذا التقييم هو للمتابعة والتثقيف الصحي ولا يُعد بديلاً عن الفحص السريري من قبل الطبيب.'
                        : 'This assessment is for monitoring and health education and does not replace in-person pediatric examination.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: [ عرض مخطط النمو ] [ 🩺 مراسلة الطبيب ] */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToChart();
                  }}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'عرض مخطط النمو' : 'View Growth Chart'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateToDoctor();
                  }}
                  className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{language === 'ar' ? '🩺 مراسلة الطبيب' : '🩺 Message Doctor'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: TECHNICAL WHO DETAILS (Section 15)                     */}
          {/* ============================================================== */}
          {activeTab === 'technical' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center justify-between">
                  <span>{language === 'ar' ? 'التفاصيل الحسابية الدقيقة' : 'Technical Calculation Details'}</span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Deterministic Zero-AI
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? growthStatusOutput.doctorView.technicalSummaryAr
                    : growthStatusOutput.doctorView.technicalSummaryEn}
                </p>
              </div>

              {/* Reasons Array Breakdown */}
              <div className="space-y-2">
                <strong className="text-white text-xs block">
                  {language === 'ar' ? 'أسباب التصنيف الطبي:' : 'Classification Reasons:'}
                </strong>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {(language === 'ar' ? growthStatusOutput.reasonsAr : growthStatusOutput.reasons).map(
                    (r, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Technical Indicator Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs text-slate-300 min-w-[500px]">
                  <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 border-b border-slate-800 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Indicator</th>
                      <th className="py-2.5 px-3">Raw Z</th>
                      <th className="py-2.5 px-3">%tile</th>
                      <th className="py-2.5 px-3">LMS (L, M, S)</th>
                      <th className="py-2.5 px-3">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {growthStatusOutput.applicableIndicatorsList.map((ind) => (
                      <tr key={ind.indicator} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-white font-sans">{ind.indicatorNameEn}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">{ind.zScoreDisplayed}</td>
                        <td className="py-2.5 px-3 text-slate-200">{cleanPercentileVal(ind.percentile)}</td>
                        <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                          {ind.lmsParameters
                            ? `L:${ind.lmsParameters.L.toFixed(2)}, M:${ind.lmsParameters.M.toFixed(2)}, S:${ind.lmsParameters.S.toFixed(3)}`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[10px] font-sans">
                          {ind.reference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 3: DOCTOR INSPECTION VIEW (Section 16)                    */}
          {/* ============================================================== */}
          {activeTab === 'doctor' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-400" />
                  <strong className="text-xs sm:text-sm font-bold text-white">
                    {language === 'ar' ? 'لوحة تدقيق الطبيب والبيانات الأولية' : 'Doctor Raw Inspection Panel'}
                  </strong>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? 'تعرض هذه اللوحة القيم الحسابية الأولية وفق صيغة WHO LMS دون أي تدخل أو تقريب توليدي، وتتيح للطبيب مراجعة معلمات المنحنى القياسي بدقة.'
                    : 'Displays raw calculated parameters under WHO LMS methodology without generative modifications, enabling clinical inspection of curve parameters.'}
                </p>
                <div className="pt-1 text-[11px] text-emerald-300 font-medium">
                  {language === 'ar' ? 'التوصية الطبية السريرية:' : 'Clinical Recommendation:'}{' '}
                  <span className="text-slate-200">{growthStatusOutput.doctorRecommendation}</span>
                </div>
              </div>

              {/* Raw Values Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                {growthStatusOutput.doctorView.indicators.map((docInd, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-sans font-bold text-white text-xs">{docInd.indicatorName}</span>
                      <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Z = {docInd.zScoreDisplayed}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Measurement:</span>
                        <strong className="text-slate-200">{docInd.measurementValue}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Percentile:</span>
                        <strong className="text-slate-200">{cleanPercentileVal(docInd.percentile)}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Reference:</span>
                        <span className="text-slate-300 font-sans text-[10px]">{docInd.reference}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Dataset:</span>
                        <span className="text-slate-300 font-sans text-[10px]">{docInd.dataset}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Method:</span>
                        <span className="text-emerald-400 text-[10px]">{docInd.calculationMethod}</span>
                      </div>
                      {docInd.rawParameters && (
                        <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-800/80 text-[10px]">
                          <span>L: {docInd.rawParameters.L.toFixed(4)}</span>
                          <span>M: {docInd.rawParameters.M.toFixed(4)}</span>
                          <span>S: {docInd.rawParameters.S.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'ar'
                ? 'وفق معايير نمو الأطفال لمنظمة الصحة العالمية (WHO)'
                : 'WHO Child Growth Standards & Reference'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

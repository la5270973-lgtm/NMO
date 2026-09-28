/**
 * NMO | نمو — Child Growth Application
 * Phase 2 — Deterministic Growth Status Engine Integration
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 * Brand: نمو | NMO
 */

import React, { useState, useMemo } from 'react';
import {
  Home,
  Users,
  TrendingUp,
  Stethoscope,
  Settings,
  Plus,
  Ruler,
  Scale,
  Brain,
  Activity,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Info,
  Sparkles,
  User,
  ArrowRight,
  Clock,
  Compass,
  FileText,
  FlaskConical,
  HelpCircle,
} from 'lucide-react';

import { LanguageProvider, useTranslation } from './i18n/LanguageContext.tsx';
import { ChildProfile, MeasurementEntry, DoctorConsultation } from './types/child.ts';
import { WHOGrowthEngine } from './engine/WHOGrowthEngine.ts';
import { GrowthStatusEngine } from './engine/GrowthStatusEngine.ts';
import { GrowthStatusValidationSuite } from './engine/GrowthStatusValidationSuite.ts';
import { AgeCalculator } from './engine/AgeCalculator.ts';
import { formatMedicalValue, cleanPercentile } from './i18n/formatters.ts';
import { GrowthChart } from './components/GrowthChart.tsx';
import { AddMeasurementModal } from './components/AddMeasurementModal.tsx';
import { AddChildModal } from './components/AddChildModal.tsx';
import { DoctorMessaging } from './components/DoctorMessaging.tsx';
import { GrowthAnalysisModal } from './components/GrowthAnalysisModal.tsx';
import { GrowthAnalysisScreen } from './components/GrowthAnalysisScreen.tsx';
import { GrowthStatusTestRunnerModal } from './components/GrowthStatusTestRunnerModal.tsx';
import { WHOChartValidationModal } from './components/WHOChartValidationModal.tsx';

type NavigationTab = 'home' | 'children' | 'growth' | 'doctor' | 'settings';

export default function App() {
  return (
    <LanguageProvider>
      <NMOAppContent />
    </LanguageProvider>
  );
}

function NMOAppContent() {
  const {
    t,
    language,
    setLanguage,
    isRTL,
    formatDate,
    formatAge,
    unitSystem,
    setUnitSystem,
    formatHeightVal,
    formatWeightVal,
    formatHCVal,
    formatBMIVal,
    formatPercentile,
  } = useTranslation();

  // Active navigation tab (5 items strictly: الرئيسية, أطفالي, النمو, الطبيب, الإعدادات)
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Modals state
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [isGrowthAnalysisOpen, setIsGrowthAnalysisOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isChartValidationOpen, setIsChartValidationOpen] = useState(false);

  // Pre-attached structured growth summary when navigating to Doctor Messaging
  const [doctorPrefilledSummary, setDoctorPrefilledSummary] = useState<string | null>(null);

  // Parent / User separation (Founder & Guardian)
  const parentUser = useMemo(() => {
    return {
      name: language === 'ar' ? 'حسن الزيدي' : 'Hasan Al_Zaidi',
      role: language === 'ar' ? 'ولي الأمر' : 'Guardian',
    };
  }, [language]);

  // Demo Children: Ahmad (أحمد) per Section 14 & 19 (DOB: 2024-06-15, Age 835 days = 2y 3m 13d)
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([
    {
      id: 'c-ahmed',
      name: language === 'ar' ? 'أحمد' : 'Ahmed',
      sex: 'male',
      dateOfBirth: '2024-06-15', // Exactly 835 days as of 2026-09-28 (2 years, 3 months, 13 days)
      avatarColor: 'from-blue-600 to-teal-600',
    },
    {
      id: 'c-maryam',
      name: language === 'ar' ? 'مريم' : 'Maryam',
      sex: 'female',
      dateOfBirth: '2023-09-10', // ~3 years old
      avatarColor: 'from-rose-500 to-pink-600',
    },
  ]);

  const [selectedChildId, setSelectedChildId] = useState<string>('c-ahmed');

  // Initial measurements computed deterministically via WHOGrowthEngine
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>(() => {
    // Ahmed Section 19 validated benchmark measurement
    // Male, DOB: 2024-06-15, Measurement: 2026-09-28, Age: 835 days
    // Height: 88.5 cm, Weight: 12.5 kg, HC: 48.0 cm
    const m1Assessment = WHOGrowthEngine.assessGrowth({
      childId: 'c-ahmed',
      sex: 'male',
      dateOfBirth: '2024-06-15',
      measurementDate: '2026-09-28',
      weightKg: 12.5,
      heightLengthCm: 88.5,
      headCircumferenceCm: 48.0,
      measurementPosition: 'standing',
    });

    return [
      {
        id: 'm-ahmed-1',
        childId: 'c-ahmed',
        date: '2026-09-28',
        weightKg: 12.5,
        heightCm: 88.5,
        headCircumferenceCm: 48.0,
        position: 'standing',
        note: 'فحص دوري عمر سنتان و3 أشهر و13 يوماً',
        assessment: m1Assessment,
        createdAt: '2026-09-28T10:00:00Z',
      },
    ];
  });

  // Doctor Consultations
  const [consultations, setConsultations] = useState<DoctorConsultation[]>([
    {
      id: 'cons-1',
      childId: 'c-ahmed',
      childName: language === 'ar' ? 'أحمد' : 'Ahmed',
      question:
        language === 'ar'
          ? 'دكتور حسن، تم قياس أحمد اليوم بعمر سنتان و3 أشهر و13 يوماً، والوزن 12.5 كغم والطول 88.5 سم ومحيط الرأس 48 سم. هل كل المؤشرات متزنة؟'
          : 'Dr. Hasan, Ahmed was measured today at 2 years, 3 months, 13 days. Weight is 12.5 kg, height 88.5 cm, and head circumference 48 cm. Are his indicators balanced?',
      sentAt: '2026-09-28',
      status: 'replied',
      reply:
        language === 'ar'
          ? 'أهلاً بكم. قياسات نمو أحمد الحالية متزنة تماماً وتقع ضمن النطاق المتوقع وفق معايير منظمة الصحة العالمية (WHO). الطول بالنسبة للعمر (Z = -0.45) والوزن بالنسبة للعمر (Z = -0.22) والوزن بالنسبة للطول (Z = -0.03) وBMI (Z = +0.06) ومحيط الرأس (Z = -0.48) جميعها متناسقة. يُنصح بمواصلة المتابعة الدورية.'
          : 'Welcome. Ahmed’s current growth measurements align closely with the WHO Child Growth Standards. Height-for-age (Z = -0.45), Weight-for-age (Z = -0.22), Weight-for-height (Z = -0.03), BMI-for-age (Z = +0.06), and Head circumference (Z = -0.48) all reflect reassuring, balanced development. Continue with varied meals and routine check-ins.',
      repliedAt: '2026-09-28',
      doctorName: language === 'ar' ? 'د. حسن الزيدي' : 'Dr. Hasan Abdulzahra Al_Zaidi',
    },
  ]);

  // Selected child
  const selectedChild = useMemo(() => {
    return childrenList.find((c) => c.id === selectedChildId) || childrenList[0];
  }, [childrenList, selectedChildId]);

  // Filtered measurements for selected child
  const childMeasurements = useMemo(() => {
    if (!selectedChild) return [];
    return measurements
      .filter((m) => m.childId === selectedChild.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [measurements, selectedChild]);

  // Latest measurement for selected child
  const latestMeasurement = useMemo(() => {
    if (childMeasurements.length === 0) return null;
    return childMeasurements[childMeasurements.length - 1];
  }, [childMeasurements]);

  // Deterministic assessments history
  const childAssessmentsHistory = useMemo(() => {
    return childMeasurements
      .map((m) => m.assessment)
      .filter((a): a is NonNullable<typeof a> => a !== undefined);
  }, [childMeasurements]);

  // Full Phase 2 Growth Status Output from GrowthStatusEngine
  const growthStatusOutput = useMemo(() => {
    if (!latestMeasurement?.assessment) return null;
    return GrowthStatusEngine.evaluate(
      {
        childId: selectedChild.id,
        age: latestMeasurement.assessment.age,
        sex: selectedChild.sex,
        indicators: {
          heightLength: latestMeasurement.assessment.heightLength,
          weightForAge: latestMeasurement.assessment.weightForAge,
          weightForLengthOrHeight: latestMeasurement.assessment.weightForLengthOrHeight,
          bmiForAge: latestMeasurement.assessment.bmiForAge,
          headCircumferenceForAge: latestMeasurement.assessment.headCircumferenceForAge,
        },
        historicalAssessments: childAssessmentsHistory,
      },
      language
    );
  }, [selectedChild, latestMeasurement, childAssessmentsHistory, language]);

  // Dashboard adapter
  const dashboardGrowthStatus = useMemo(() => {
    return GrowthStatusEngine.evaluateChildGrowthStatus(
      latestMeasurement?.assessment,
      childAssessmentsHistory,
      language
    );
  }, [latestMeasurement, childAssessmentsHistory, language]);

  // Handlers
  const handleSaveMeasurement = (entry: MeasurementEntry) => {
    setMeasurements((prev) => [...prev, entry]);
  };

  const handleSaveChild = (newChild: ChildProfile) => {
    setChildrenList((prev) => [...prev, newChild]);
    setSelectedChildId(newChild.id);
  };

  const handleSendMessage = (question: string, hasAttachment: boolean, structuredContext?: string) => {
    if (!selectedChild) return;
    const newMsg: DoctorConsultation = {
      id: `cons-${Date.now()}`,
      childId: selectedChild.id,
      childName: selectedChild.name,
      question,
      sentAt: new Date().toISOString().slice(0, 10),
      status: 'waiting',
      hasAttachment,
      structuredContext,
    };
    setConsultations((prev) => [newMsg, ...prev]);
    setDoctorPrefilledSummary(null);
  };

  const handleNavigateToDoctorWithMessage = (summaryText: string) => {
    setDoctorPrefilledSummary(summaryText);
    setActiveTab('doctor');
    setIsGrowthAnalysisOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-white">
      {/* ============================================================== */}
      {/* TOP HEADER (Compact, Responsive, No Overflow)                 */}
      {/* ============================================================== */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2.5">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-lg sm:text-xl shrink-0">
              ن
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                  {t('brand_tagline')}
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Phase 2 Engine
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {t('founder_title')}: <strong className="text-slate-200 font-medium">{t('founder_name')}</strong>
              </p>
            </div>
          </div>

          {/* User Separation & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Child Switcher dropdown */}
            {childrenList.length > 0 && (
              <div className="relative">
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Language Quick Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>

        {/* Desktop Top Navigation Tabs */}
        <div className="hidden sm:flex max-w-5xl mx-auto px-4 sm:px-6 space-x-1 rtl:space-x-reverse border-t border-slate-800/60 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'home'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{t('nav_home')}</span>
          </button>

          <button
            onClick={() => setActiveTab('children')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'children'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('nav_my_children')}</span>
          </button>

          <button
            onClick={() => setActiveTab('growth')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'growth'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t('nav_growth')}</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'doctor'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{t('nav_doctor')}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('nav_settings')}</span>
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTENT CONTAINER                                         */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-12">
        {/* ============================================================== */}
        {/* TAB 1: الرئيسية / HOME (PARENT-FACING DASHBOARD)                */}
        {/* Exact Section 14 Layout Generated Deterministically             */}
        {/* ============================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            {/* User vs Child Separation Card (Section 3) */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">{t('parent_label')}:</span>
                <strong className="text-white font-semibold">{parentUser.name}</strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                  {parentUser.role}
                </span>
              </div>
              <div className="text-slate-400 text-[11px] hidden sm:block">
                <span>{t('child_label')}: </span>
                <strong className="text-emerald-400 font-semibold">{selectedChild.name}</strong>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION 14: PARENT-FACING RESULT CARD                          */}
            {/* Exact Status & Indicators Generated Deterministically by Engine */}
            {/* ============================================================== */}
            {selectedChild && (
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl relative overflow-hidden">
                {/* Header: Child Name, Age, Status Badge */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800/80 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl">👦</span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {selectedChild.name}
                      </h2>
                    </div>
                    {/* Age in words */}
                    <div className="text-xs sm:text-sm text-slate-300 font-medium">
                      <span className="text-slate-400">{language === 'ar' ? 'العمر: ' : 'Age: '}</span>
                      <strong className="text-white font-semibold">
                        {latestMeasurement?.assessment
                          ? formatAge(latestMeasurement.assessment.age)
                          : formatAge(AgeCalculator.calculate(selectedChild.dateOfBirth, '2026-09-28'))}
                      </strong>
                    </div>

                    {/* Reference Display (Requirement 2) */}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {language === 'ar'
                          ? 'وفق معايير نمو الأطفال لمنظمة الصحة العالمية (WHO)'
                          : 'Based on World Health Organization (WHO) Child Growth Standards'}
                      </span>
                    </div>
                  </div>

                  {/* Deterministic Growth Status Badge */}
                  <div className="flex flex-col items-end">
                    <div
                      className={`px-4 py-2 rounded-2xl border ${dashboardGrowthStatus.badgeBg} ${dashboardGrowthStatus.badgeBorder} flex items-center gap-2 shadow-sm`}
                    >
                      <span className="text-lg">{dashboardGrowthStatus.iconSymbol}</span>
                      <strong className={`text-xs sm:text-sm font-bold ${dashboardGrowthStatus.badgeText}`}>
                        {dashboardGrowthStatus.statusLabel}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Section 10 Safe Phrasing */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-xs sm:text-sm text-slate-200 italic leading-relaxed relative z-10">
                  "{growthStatusOutput?.parentExplanation || 'قياسات النمو الحالية تقع ضمن النطاق المتوقع وفق مرجع النمو المستخدم.'}"
                </div>

                {/* All 5 Individual Anthropometric Indicators (Section 14) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 relative z-10">
                  {/* 1. Height-for-age */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        <span>📏</span>
                        <span>{language === 'ar' ? 'الطول بالنسبة للعمر' : 'Height-for-age'}</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-teal-400">
                        {latestMeasurement ? formatHeightVal(latestMeasurement.heightCm) : '88.5 cm'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs pt-0.5">
                      <span className="text-emerald-400 font-bold">
                        Z: {latestMeasurement?.assessment?.heightLength?.zScoreDisplayed || '-0.45'}
                      </span>
                      <span className="text-slate-300">
                        {formatPercentile(latestMeasurement?.assessment?.heightLength?.percentile ?? 32.7)}
                      </span>
                    </div>
                  </div>

                  {/* 2. Weight-for-age */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        <span>⚖️</span>
                        <span>{language === 'ar' ? 'الوزن بالنسبة للعمر' : 'Weight-for-age'}</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-400">
                        {latestMeasurement ? formatWeightVal(latestMeasurement.weightKg) : '12.5 kg'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs pt-0.5">
                      <span className="text-emerald-400 font-bold">
                        Z: {latestMeasurement?.assessment?.weightForAge?.zScoreDisplayed || '-0.22'}
                      </span>
                      <span className="text-slate-300">
                        {formatPercentile(latestMeasurement?.assessment?.weightForAge?.percentile ?? 41.3)}
                      </span>
                    </div>
                  </div>

                  {/* 3. Weight-for-length/height */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        <span>⚖️</span>
                        <span>{language === 'ar' ? 'الوزن بالنسبة للطول' : 'Weight-for-height'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        {latestMeasurement ? formatWeightVal(latestMeasurement.weightKg) : '12.5 kg'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs pt-0.5">
                      <span className="text-emerald-400 font-bold">
                        Z: {latestMeasurement?.assessment?.weightForLengthOrHeight?.zScoreDisplayed || '-0.03'}
                      </span>
                      <span className="text-slate-300">
                        {formatPercentile(latestMeasurement?.assessment?.weightForLengthOrHeight?.percentile ?? 48.8)}
                      </span>
                    </div>
                  </div>

                  {/* 4. BMI-for-age */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        <span>📊</span>
                        <span>{language === 'ar' ? 'مؤشر كتلة الجسم بالنسبة للعمر' : 'BMI-for-age'}</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-indigo-400">
                        {latestMeasurement?.assessment?.calculatedBMI
                          ? formatBMIVal(latestMeasurement.assessment.calculatedBMI)
                          : '15.96 kg/m²'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs pt-0.5">
                      <span className="text-emerald-400 font-bold">
                        Z: {latestMeasurement?.assessment?.bmiForAge?.zScoreDisplayed || '+0.06'}
                      </span>
                      <span className="text-slate-300">
                        {formatPercentile(latestMeasurement?.assessment?.bmiForAge?.percentile ?? 52.3)}
                      </span>
                    </div>
                  </div>

                  {/* 5. Head circumference-for-age */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        <span>🧠</span>
                        <span>{language === 'ar' ? 'محيط الرأس بالنسبة للعمر' : 'Head circumference-for-age'}</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-pink-400">
                        {latestMeasurement ? formatHCVal(latestMeasurement.headCircumferenceCm) : '48.0 cm'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs pt-0.5">
                      <span className="text-emerald-400 font-bold">
                        Z: {latestMeasurement?.assessment?.headCircumferenceForAge?.zScoreDisplayed || '-0.48'}
                      </span>
                      <span className="text-slate-300">
                        {formatPercentile(latestMeasurement?.assessment?.headCircumferenceForAge?.percentile ?? 31.5)}
                      </span>
                    </div>
                  </div>

                  {/* 6. Growth Trajectory / Trend */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        <span>📈</span>
                        <span>{t('growth_trend_label')}:</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {latestMeasurement ? formatDate(latestMeasurement.date) : '28 سبتمبر 2026'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-emerald-400 truncate pt-0.5">
                      {growthStatusOutput?.trend.trendLabelAr || 'بيانات طولية غير كافية'}
                    </div>
                  </div>
                </div>

                {/* Section 14 Action Buttons: [ عرض مخطط النمو ] [ ماذا تعني هذه النتائج؟ ] [ 🩺 مراسلة الطبيب ] */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* [ عرض تحليل النمو ] */}
                    <button
                      onClick={() => setActiveTab('growth')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Activity className="w-4 h-4" />
                      <span>{language === 'ar' ? 'عرض تحليل النمو' : 'View Growth Analysis'}</span>
                    </button>

                    {/* [ عرض مخطط النمو ] */}
                    <button
                      onClick={() => setActiveTab('growth')}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'ar' ? 'عرض مخطط النمو' : 'Growth Chart'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* [ ماذا تعني هذه النتائج؟ ] */}
                    <button
                      onClick={() => setActiveTab('growth')}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-800 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                      <span>{language === 'ar' ? 'ماذا تعني هذه النتائج؟' : 'What do results mean?'}</span>
                    </button>

                    {/* [ 🩺 مراسلة الطبيب ] */}
                    <button
                      onClick={() => setActiveTab('doctor')}
                      className="px-3.5 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? '🩺 مراسلة الطبيب' : '🩺 Message Doctor'}</span>
                    </button>
                  </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setIsAddMeasurementOpen(true)}
                className="p-3.5 rounded-2xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-white flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{t('add_measurement')}</span>
              </button>

              <button
                onClick={() => setIsAddChildOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-center gap-2 text-xs font-semibold transition-all shadow-sm"
              >
                <User className="w-4 h-4 text-teal-400" />
                <span>{t('add_child')}</span>
              </button>

              <button
                onClick={() => setIsTestRunnerOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center gap-2 text-xs font-semibold transition-all shadow-sm"
              >
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'فحص الحالة (28)' : 'Verify Status (28)'}</span>
              </button>

              <button
                onClick={() => setIsChartValidationOpen(true)}
                className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-300 flex items-center justify-center gap-2 text-xs font-semibold transition-all shadow-sm"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'فحص المخطط (15)' : 'Verify Chart (15)'}</span>
              </button>
            </div>

            {/* Educational & Disclaimer Banner */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-2.5 text-xs text-slate-300">
              <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'إرشادات متابعة النمو' : 'Growth Guidance & Education'}</span>
              </h3>
              <p className="leading-relaxed">• {t('edu_comparison')}</p>
              <p className="leading-relaxed">• {t('edu_trajectory')}</p>
              <p className="leading-relaxed text-slate-400">• {t('edu_non_diagnostic')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{t('disclaimer_full')}</p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: أطفالي / MY CHILDREN (CHILD PROFILES)                    */}
        {/* ============================================================== */}
        {activeTab === 'children' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{t('nav_my_children')}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t('child_profile')}</p>
              </div>

              <button
                onClick={() => setIsAddChildOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('add_child')}</span>
              </button>
            </div>

            {/* Parent Info Indicator */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center font-bold">
                  {parentUser.name[0]}
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">{t('parent_label')}</span>
                  <strong className="text-white text-sm">{parentUser.name}</strong>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {parentUser.role}
              </span>
            </div>

            {/* Children Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {childrenList.map((child) => {
                const childM = measurements.filter((m) => m.childId === child.id);
                const lastM = childM.length > 0 ? childM[childM.length - 1] : null;

                return (
                  <div
                    key={child.id}
                    className={`bg-slate-900 border rounded-3xl p-5 space-y-4 transition-all ${
                      child.id === selectedChildId
                        ? 'border-emerald-500/50 ring-1 ring-emerald-500/20 shadow-md'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${child.avatarColor} flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0`}
                        >
                          {child.name[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-white truncate">{child.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 truncate">
                            <span>{child.sex === 'male' ? t('sex_male') : t('sex_female')}</span>
                            <span>•</span>
                            <span className="font-mono">{formatDate(child.dateOfBirth)}</span>
                          </div>
                        </div>
                      </div>

                      {child.id === selectedChildId ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          {t('select_child')}
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedChildId(child.id)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                        >
                          {t('switch_child')}
                        </button>
                      )}
                    </div>

                    {lastM ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800/80">
                          <span>{t('last_measurement')}</span>
                          <span className="font-mono">{formatDate(lastM.date)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">{t('height')}</span>
                            <strong className="text-white">{formatHeightVal(lastM.heightCm)}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">{t('weight')}</span>
                            <strong className="text-white">{formatWeightVal(lastM.weightKg)}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">{t('bmi')}</span>
                            <strong className="text-emerald-400">
                              {lastM.assessment?.calculatedBMI
                                ? formatBMIVal(lastM.assessment.calculatedBMI)
                                : '—'}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500">
                        {t('no_measurements_yet')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: النمو / GROWTH ANALYSIS SCREEN (PHASE 4 FULL SCREEN)     */}
        {/* ============================================================== */}
        {activeTab === 'growth' && (
          <GrowthAnalysisScreen
            child={selectedChild}
            latestMeasurement={latestMeasurement}
            allMeasurements={childMeasurements}
            growthStatusOutput={growthStatusOutput}
            onNavigateToDoctorWithMessage={handleNavigateToDoctorWithMessage}
            onOpenAddMeasurement={() => setIsAddMeasurementOpen(true)}
            onOpenChartValidation={() => setIsChartValidationOpen(true)}
            onOpenEngineValidation={() => setIsTestRunnerOpen(true)}
          />
        )}

        {/* ============================================================== */}
        {/* TAB 4: الطبيب / DOCTOR MESSAGING                                */}
        {/* ============================================================== */}
        {activeTab === 'doctor' && (
          <DoctorMessaging
            child={selectedChild}
            consultations={consultations}
            onSendMessage={handleSendMessage}
            attachedSummary={doctorPrefilledSummary}
            onClearAttachedSummary={() => setDoctorPrefilledSummary(null)}
          />
        )}

        {/* ============================================================== */}
        {/* TAB 5: الإعدادات / SETTINGS                                     */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="pb-1">
              <h2 className="text-lg sm:text-xl font-bold text-white">{t('nav_settings')}</h2>
              <p className="text-xs text-slate-400 mt-0.5">NMO Preferences & Localization</p>
            </div>

            {/* Language Selection Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{t('settings_language')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ar' ? 'اختر لغة واجهة التطبيق' : 'Select application interface language'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`p-4 rounded-2xl border text-left rtl:text-right flex items-center justify-between transition-all ${
                    language === 'ar'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇮🇶</span>
                    <div>
                      <strong className="text-sm font-bold block text-white">العربية</strong>
                      <span className="text-xs text-slate-400">واجهة عربية</span>
                    </div>
                  </div>
                  {language === 'ar' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-2xl border text-left rtl:text-right flex items-center justify-between transition-all ${
                    language === 'en'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <strong className="text-sm font-bold block text-white">English</strong>
                      <span className="text-xs text-slate-400">English interface</span>
                    </div>
                  </div>
                  {language === 'en' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Units Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{t('unit_system')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'اختر نظام وحدات قياس الطول والوزن المعروضة'
                    : 'Choose your preferred units for height and weight'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`p-4 rounded-2xl border text-left rtl:text-right flex items-center justify-between transition-all ${
                    unitSystem === 'metric'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-white">{t('unit_metric')}</strong>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {language === 'ar' ? 'الافتراضي' : 'Default'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-1 font-mono">
                      cm, kg, kg/m²
                    </span>
                  </div>
                  {unitSystem === 'metric' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setUnitSystem('imperial')}
                  className={`p-4 rounded-2xl border text-left rtl:text-right flex items-center justify-between transition-all ${
                    unitSystem === 'imperial'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <strong className="text-sm font-bold text-white block">{t('unit_imperial')}</strong>
                    <span className="text-xs text-slate-400 block mt-1 font-mono">
                      in, lb
                    </span>
                  </div>
                  {unitSystem === 'imperial' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Test Suite Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'ar' ? 'حزمة اختبارات محرك الحالة (28 اختبار)' : 'Growth Status Engine Suite (28 Tests)'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'ar' ? 'التحقق الآلي من القواعد الطبية القطعية لـ WHO 2006 & 2007' : 'Deterministic automated testing of WHO medical rules'}
                  </p>
                </div>
                <button
                  onClick={() => setIsTestRunnerOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  {language === 'ar' ? 'تشغيل الاختبارات' : 'Run Tests'}
                </button>
              </div>
            </div>

            {/* WHO Chart Validation Suite Card (15 Tests) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'ar' ? 'فحص واعتماد محرك المخطط البياني (15 اختباراً لـ WHO)' : 'WHO Chart Validation Suite (15 Tests)'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'ar' ? 'التحقق الرياضي من دقة المنحنيات واستخراج نقاط WHO' : 'Mathematical verification of curve accuracy and WHO points'}
                  </p>
                </div>
                <button
                  onClick={() => setIsChartValidationOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  {language === 'ar' ? 'فحص المخطط' : 'Verify Chart'}
                </button>
              </div>
            </div>

            {/* About NMO Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">{t('about_nmo')}</h3>
                <span className="text-xs text-slate-400 font-mono">v2.0 (Phase 2)</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p className="text-sm font-bold text-white">{t('brand_tagline')}</p>
                <p>{t('about_description')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">{t('founder_title')}</span>
                  <strong className="text-sm text-white font-bold">{t('founder_name')}</strong>
                </div>
                <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                  {t('engine_badge')}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span>{t('copyright')}</span>
                <span>WHO 2006 & 2007 Standards</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MOBILE RTL BOTTOM NAVIGATION                                   */}
      {/* ============================================================== */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 pb-[env(safe-area-inset-bottom)] sm:hidden shadow-2xl">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          {/* 1. الرئيسية */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 text-center min-w-0 transition-colors ${
              activeTab === 'home'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-emerald-500/15' : ''}`}>
              <Home className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[10px] leading-tight font-medium truncate w-full text-center mt-0.5">
              {t('nav_home')}
            </span>
          </button>

          {/* 2. أطفالي */}
          <button
            onClick={() => setActiveTab('children')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 text-center min-w-0 transition-colors ${
              activeTab === 'children'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'children' ? 'bg-emerald-500/15' : ''}`}>
              <Users className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[10px] leading-tight font-medium truncate w-full text-center mt-0.5">
              {t('nav_my_children')}
            </span>
          </button>

          {/* 3. النمو */}
          <button
            onClick={() => setActiveTab('growth')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 text-center min-w-0 transition-colors ${
              activeTab === 'growth'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'growth' ? 'bg-emerald-500/15' : ''}`}>
              <TrendingUp className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[10px] leading-tight font-medium truncate w-full text-center mt-0.5">
              {t('nav_growth')}
            </span>
          </button>

          {/* 4. الطبيب */}
          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 text-center min-w-0 transition-colors ${
              activeTab === 'doctor'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'doctor' ? 'bg-emerald-500/15' : ''}`}>
              <Stethoscope className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[10px] leading-tight font-medium truncate w-full text-center mt-0.5">
              {t('nav_doctor')}
            </span>
          </button>

          {/* 5. الإعدادات */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1 px-0.5 text-center min-w-0 transition-colors ${
              activeTab === 'settings'
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-emerald-500/15' : ''}`}>
              <Settings className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[10px] leading-tight font-medium truncate w-full text-center mt-0.5">
              {t('nav_settings')}
            </span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      {selectedChild && (
        <AddMeasurementModal
          child={selectedChild}
          isOpen={isAddMeasurementOpen}
          onClose={() => setIsAddMeasurementOpen(false)}
          onSave={handleSaveMeasurement}
        />
      )}

      <AddChildModal
        isOpen={isAddChildOpen}
        onClose={() => setIsAddChildOpen(false)}
        onSave={handleSaveChild}
      />

      {/* Phase 2: Growth Analysis Details & Doctor Inspection Modal */}
      {selectedChild && (
        <GrowthAnalysisModal
          isOpen={isGrowthAnalysisOpen}
          onClose={() => setIsGrowthAnalysisOpen(false)}
          child={selectedChild}
          latestMeasurement={latestMeasurement}
          growthStatusOutput={growthStatusOutput}
          onNavigateToChart={() => setActiveTab('growth')}
          onNavigateToDoctor={() => setActiveTab('doctor')}
        />
      )}

      {/* Phase 2: Growth Status Test Runner Modal */}
      <GrowthStatusTestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

      {/* Phase 3: WHO Growth Chart Validation Suite Modal */}
      <WHOChartValidationModal
        isOpen={isChartValidationOpen}
        onClose={() => setIsChartValidationOpen(false)}
      />
    </div>
  );
}

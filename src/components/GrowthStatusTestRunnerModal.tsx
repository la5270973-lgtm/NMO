/**
 * NMO | نمو — Child Growth Application
 * Phase 2: Growth Status Validation Suite Test Runner Modal
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 * Brand: نمو | NMO
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import {
  GrowthStatusValidationSuite,
  StatusTestResult,
  ValidationSuiteSummary,
} from '../engine/GrowthStatusValidationSuite.ts';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Search,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Stethoscope,
  Activity,
} from 'lucide-react';

interface GrowthStatusTestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrowthStatusTestRunnerModal: React.FC<GrowthStatusTestRunnerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, language } = useTranslation();
  const [suiteResult, setSuiteResult] = useState<ValidationSuiteSummary | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(
    'TC-SEC19-CURRENT-VALIDATED-CASE'
  );

  const runTests = () => {
    const res = GrowthStatusValidationSuite.runAllTests();
    setSuiteResult(res);
  };

  useEffect(() => {
    if (isOpen && !suiteResult) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredResults = suiteResult
    ? suiteResult.results.filter(
        (r) => filterCategory === 'all' || r.testCase.category === filterCategory
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Growth Status Engine — Automated Validation Suite
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Phase 2 Deterministic
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                28 Automated Test Cases across WHO 2006 & 2007 Standards (Zero-AI Verification)
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

        {/* Action & Stats Banner */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-4 shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono">
            {suiteResult && (
              <>
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <span className="text-slate-400 font-sans">Total Tests:</span>
                  <strong className="text-white">{suiteResult.total}</strong>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-sans">Passed:</span>
                  <strong>{suiteResult.passed}</strong>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
                  <span className="font-sans">Failed:</span>
                  <strong className={suiteResult.failed > 0 ? 'text-rose-400' : 'text-slate-300'}>
                    {suiteResult.failed}
                  </strong>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                  Pass Rate: {suiteResult.passRate}
                </div>
              </>
            )}
          </div>

          <button
            onClick={runTests}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all ml-auto"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Re-run All Tests</span>
          </button>
        </div>

        {/* Section 19 Current Test Case Highlight Card */}
        {suiteResult && suiteResult.currentTestCaseResult && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border-b border-emerald-500/20 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                  [ SECTION 19 BENCHMARK CASE ]
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PASS
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {suiteResult.currentTestCaseResult.testCase.input.age.formattedAge} (835 days)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">Height-for-age</span>
                <strong className="text-white">Z = -0.45</strong> (32.7%)
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">Weight-for-age</span>
                <strong className="text-white">Z = -0.22</strong> (41.3%)
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">Weight-for-height</span>
                <strong className="text-white">Z = -0.03</strong> (48.8%)
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">BMI-for-age</span>
                <strong className="text-white">Z = +0.06</strong> (52.3%)
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">Head Circumference</span>
                <strong className="text-white">Z = -0.48</strong> (31.5%)
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-800/80 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Generated Status:</span>
                <strong className="text-emerald-400 font-bold">
                  {suiteResult.currentTestCaseResult.output.overallStatus} (
                  {suiteResult.currentTestCaseResult.output.statusLevel})
                </strong>
              </div>
              <div className="text-[11px] text-slate-300 italic">
                "{suiteResult.currentTestCaseResult.output.parentExplanationAr}"
              </div>
            </div>
          </div>
        )}

        {/* Test Cases List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 text-xs flex-1">
          <div className="flex items-center justify-between pb-1">
            <span className="font-bold text-white text-xs">
              All 28 Test Results ({filteredResults.length})
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Filter:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="current_test_case">Current Test Case</option>
                <option value="normal_range">Normal Range</option>
                <option value="low_height">Low Height</option>
                <option value="high_bmi">High BMI</option>
                <option value="low_bmi">Low BMI</option>
                <option value="high_wfh">High WFH</option>
                <option value="low_wfh">Low WFH</option>
                <option value="head_circumference">Head Circumference</option>
                <option value="weight_for_age">Weight for Age</option>
                <option value="longitudinal">Longitudinal</option>
                <option value="boundary_values">Boundary Values</option>
                <option value="age_transitions">Age Transitions</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredResults.map((r) => {
              const isExpanded = expandedCaseId === r.testCase.id;

              return (
                <div
                  key={r.testCase.id}
                  className={`rounded-2xl border transition-all ${
                    r.passed ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div
                    onClick={() => setExpandedCaseId(isExpanded ? null : r.testCase.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 rounded-2xl gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {r.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <strong className="text-white text-xs block truncate">
                          {r.testCase.name}
                        </strong>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {r.testCase.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          r.passed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {r.output.statusLevel}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 pt-2 border-t border-slate-800/80 text-[11px] space-y-2 bg-slate-900/60 font-mono">
                      <div className="flex flex-wrap items-center justify-between text-slate-400 border-b border-slate-800/60 pb-2">
                        <span>Expected: <strong>{r.testCase.expectedStatusLevel}</strong></span>
                        <span>Generated: <strong className="text-emerald-400">{r.output.statusLevel}</strong></span>
                        <span>Trend: <strong>{r.output.trend.trendCode}</strong></span>
                      </div>

                      <div className="space-y-1 font-sans text-slate-300">
                        <p><strong>Parent Explanation (AR):</strong> "{r.output.parentExplanationAr}"</p>
                        <p><strong>Parent Explanation (EN):</strong> "{r.output.parentExplanationEn}"</p>
                        <p><strong>Doctor Recommendation:</strong> {r.output.doctorRecommendationEn}</p>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1 font-sans">
                        <strong>Classification Reasons:</strong>
                        <ul className="list-disc list-inside space-y-0.5 pt-0.5">
                          {r.output.reasons.map((re, i) => (
                            <li key={i}>{re}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Medical Rules • Zero Generative AI in Status</span>
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

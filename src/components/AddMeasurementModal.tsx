/**
 * NMO | نمو — Child Growth Application
 * Phase 5.1: Measurement Input Modal with Age-Based Deterministic Position & Dynamic Labels
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 * 
 * STRICT RULES:
 * 1. Measurement method is automatic (recumbent for < 2y, standing for >= 2y).
 * 2. Parents NEVER manually select position or enter age.
 * 3. Exact age is deterministically calculated from dateOfBirth + measurementDate.
 * 4. Input order:
 *    - تاريخ القياس (Measurement Date)
 *    - الطول (Height/Length): "الطول واقفاً (سم)" (>= 2y) or "الطول (سم)" (< 2y)
 *    - الوزن: "الوزن (كغ)"
 *    - محيط الرأس: "محيط الرأس (سم)" (only when applicable, 0-5y)
 *    - ملاحظات — اختياري (Notes — optional)
 * 5. Rejects date before DOB, future dates, and invalid dates with clear messages.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { ChildProfile, MeasurementEntry } from '../types/child.ts';
import { MeasurementPosition } from '../types/growth.ts';
import { AgeCalculator } from '../engine/AgeCalculator.ts';
import { WHOGrowthEngine } from '../engine/WHOGrowthEngine.ts';
import { X, Scale, Ruler, Brain, Calendar, FileText, Info } from 'lucide-react';

interface AddMeasurementModalProps {
  child: ChildProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: MeasurementEntry) => void;
}

export const AddMeasurementModal: React.FC<AddMeasurementModalProps> = ({
  child,
  isOpen,
  onClose,
  onSave,
}) => {
  const { t, language, formatDate } = useTranslation();

  // Local today string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Form state
  const [date, setDate] = useState<string>(todayStr);
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Automatic Age Calculation from dateOfBirth + measurementDate
  const calculatedAge = useMemo(() => {
    if (!date || !child.dateOfBirth) return null;
    if (date < child.dateOfBirth) return null;
    try {
      return AgeCalculator.calculate(child.dateOfBirth, date);
    } catch {
      return null;
    }
  }, [child.dateOfBirth, date]);

  // Method rule: < 2 years recumbent, >= 2 years standing
  const isUnder2 = useMemo(() => {
    if (!calculatedAge) return false;
    return calculatedAge.ageInDays < 731 && calculatedAge.totalCompletedMonths < 24;
  }, [calculatedAge]);

  const autoMethod: MeasurementPosition = isUnder2 ? 'recumbent' : 'standing';

  // Head circumference applicability (WHO standards up to 5 years / 60 completed months)
  const isHCApplicable = useMemo(() => {
    if (!calculatedAge) return true;
    return calculatedAge.totalCompletedMonths <= 60;
  }, [calculatedAge]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Date Validations
    if (!date) {
      setFormError(t('err_invalid_measurement_date'));
      return;
    }

    if (date < child.dateOfBirth) {
      setFormError(t('err_measurement_before_birth'));
      return;
    }

    if (date > todayStr) {
      setFormError(t('err_future_measurement_date'));
      return;
    }

    // 2. Numerical Inputs Parsing
    const parsedWeight = weightKg.trim() ? parseFloat(weightKg) : undefined;
    const parsedHeight = heightCm.trim() ? parseFloat(heightCm) : undefined;
    const parsedHC = headCircumferenceCm.trim() ? parseFloat(headCircumferenceCm) : undefined;

    if (parsedWeight === undefined && parsedHeight === undefined) {
      setFormError(t('err_required_fields'));
      return;
    }

    if (parsedHeight !== undefined && (isNaN(parsedHeight) || parsedHeight <= 0 || parsedHeight > 250)) {
      setFormError(language === 'ar' ? 'يرجى إدخال قيمة صحيحة للطول (سم).' : 'Please enter a valid height (cm).');
      return;
    }

    if (parsedWeight !== undefined && (isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 200)) {
      setFormError(language === 'ar' ? 'يرجى إدخال قيمة صحيحة للوزن (كغ).' : 'Please enter a valid weight (kg).');
      return;
    }

    if (parsedHC !== undefined && (isNaN(parsedHC) || parsedHC <= 0 || parsedHC > 80)) {
      setFormError(language === 'ar' ? 'يرجى إدخال قيمة صحيحة لمحيط الرأس (سم).' : 'Please enter a valid head circumference (cm).');
      return;
    }

    try {
      // Deterministic WHO Assessment (uses automatically determined position and exact calculated age)
      const assessment = WHOGrowthEngine.assessGrowth({
        childId: child.id,
        sex: child.sex,
        dateOfBirth: child.dateOfBirth,
        measurementDate: date,
        weightKg: parsedWeight,
        heightLengthCm: parsedHeight,
        measurementPosition: autoMethod,
        headCircumferenceCm: parsedHC,
      });

      const newEntry: MeasurementEntry = {
        id: `M-${Date.now()}`,
        childId: child.id,
        date,
        weightKg: parsedWeight || 0,
        heightCm: parsedHeight || 0,
        headCircumferenceCm: parsedHC,
        position: autoMethod,
        note: note.trim() || undefined,
        assessment,
        createdAt: new Date().toISOString(),
      };

      onSave(newEntry);
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t('err_unable_calculate'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">{t('add_measurement')}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {child.name} • {t('date_of_birth')}: {formatDate(child.dateOfBirth)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* 1. تاريخ القياس (Measurement Date)                             */}
          {/* ============================================================== */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('measurement_date')}</span>
            </label>
            <input
              type="date"
              required
              value={date}
              max={todayStr}
              min={child.dateOfBirth}
              onChange={(e) => {
                setDate(e.target.value);
                setFormError(null);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />

            {/* Informational Method Field (Determined Automatically from Age) */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {t('measurement_method_label')}
              </span>
              <span className="font-bold text-teal-400 font-sans px-2.5 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                {isUnder2 ? t('method_recumbent') : t('method_standing')}
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. الطول (Height / Length)                                     */}
          {/* ============================================================== */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {isUnder2 ? t('height_recumbent_label') : t('height_standing_label')}
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 88.5"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
          </div>

          {/* ============================================================== */}
          {/* 3. الوزن (Weight)                                              */}
          {/* ============================================================== */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('weight_kg_label')}</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 12.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
          </div>

          {/* ============================================================== */}
          {/* 4. محيط الرأس — عند الانطباق (Head Circumference — Applicable) */}
          {/* ============================================================== */}
          {isHCApplicable && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('head_circumference_cm_label')}</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 48.0"
                value={headCircumferenceCm}
                onChange={(e) => setHeadCircumferenceCm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. ملاحظات — اختياري (Notes — Optional)                        */}
          {/* ============================================================== */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('notes_optional_label')}</span>
            </label>
            <input
              type="text"
              placeholder={t('note_placeholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 font-medium transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 font-semibold shadow-lg shadow-emerald-600/20 transition-all"
            >
              {t('save_measurement')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

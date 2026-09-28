/**
 * NMO | نمو — Child Growth Application
 * Add Child Modal (Bilingual RTL/LTR)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { ChildProfile } from '../types/child.ts';
import { Sex } from '../types/growth.ts';
import { X, User, Calendar } from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: ChildProfile) => void;
}

const AVATAR_COLORS = [
  'from-emerald-500 to-teal-700',
  'from-blue-500 to-indigo-700',
  'from-rose-500 to-pink-700',
  'from-amber-500 to-orange-700',
  'from-purple-500 to-violet-700',
];

export const AddChildModal: React.FC<AddChildModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [dateOfBirth, setDateOfBirth] = useState('2024-01-01');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('err_required_fields'));
      return;
    }

    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newChild: ChildProfile = {
      id: `C-${Date.now()}`,
      name: name.trim(),
      sex,
      dateOfBirth,
      avatarColor: color,
    };

    onSave(newChild);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>{t('add_child')}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Child Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">{t('child_name')}</label>
            <input
              type="text"
              required
              placeholder="e.g. عمر / Omar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Biological Sex */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">{t('sex')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSex('male')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  sex === 'male'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/20'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>♂ {t('sex_male')}</span>
              </button>
              <button
                type="button"
                onClick={() => setSex('female')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  sex === 'female'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>♀ {t('sex_female')}</span>
              </button>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('date_of_birth')}</span>
            </label>
            <input
              type="date"
              required
              max={new Date().toISOString().slice(0, 10)}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
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
              {t('add_child')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

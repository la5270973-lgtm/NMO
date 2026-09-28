/**
 * NMO | نمو — Child Growth Application
 * Doctor Messaging Component (Bilingual RTL/LTR)
 * Founder: Dr. Hasan Abdulzahra Al_Zaidi
 */

import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { ChildProfile, DoctorConsultation } from '../types/child.ts';
import { Stethoscope, Send, Image as ImageIcon, Clock, CheckCircle2, AlertCircle, User, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface DoctorMessagingProps {
  child: ChildProfile;
  consultations: DoctorConsultation[];
  onSendMessage: (question: string, hasAttachment: boolean, structuredContext?: string) => void;
  attachedSummary?: string | null;
  onClearAttachedSummary?: () => void;
}

export const DoctorMessaging: React.FC<DoctorMessagingProps> = ({
  child,
  consultations,
  onSendMessage,
  attachedSummary,
  onClearAttachedSummary,
}) => {
  const { t, formatDate, language } = useTranslation();
  const [question, setQuestion] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [localAttachedSummary, setLocalAttachedSummary] = useState<string | null>(attachedSummary || null);
  const [isSummaryPreviewExpanded, setIsSummaryPreviewExpanded] = useState(true);

  // Sync when prop updates
  React.useEffect(() => {
    if (attachedSummary) {
      setLocalAttachedSummary(attachedSummary);
    }
  }, [attachedSummary]);

  const handleClearSummary = () => {
    setLocalAttachedSummary(null);
    if (onClearAttachedSummary) {
      onClearAttachedSummary();
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onSendMessage(question.trim(), hasAttachment || !!localAttachedSummary, localAttachedSummary || undefined);
    setQuestion('');
    setHasAttachment(false);
    setLocalAttachedSummary(null);
    if (onClearAttachedSummary) {
      onClearAttachedSummary();
    }
  };

  return (
    <div className="space-y-6">
      {/* Doctor Introduction Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{t('doctor_name_label')}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t('founder_title')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {t('consultation_disclaimer')}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('child_name')}: <strong>{child.name}</strong></span>
        </div>
      </div>

      {/* Message Composer Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>{t('write_question')}</span>
        </h3>

        {/* Structured Growth Summary Attachment Card */}
        {localAttachedSummary && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <FileText className="w-4 h-4" />
                <span>{t('structured_summary_attached')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSummaryPreviewExpanded(!isSummaryPreviewExpanded)}
                  className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
                >
                  <span>{isSummaryPreviewExpanded ? (language === 'ar' ? 'طي' : 'Collapse') : (language === 'ar' ? 'عرض' : 'Expand')}</span>
                  {isSummaryPreviewExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleClearSummary}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 text-[11px] flex items-center gap-1 transition-colors"
                  title={t('structured_summary_remove')}
                >
                  <X className="w-3 h-3" />
                  <span>{t('structured_summary_remove')}</span>
                </button>
              </div>
            </div>

            {isSummaryPreviewExpanded && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20 text-slate-300 font-mono text-[11px] whitespace-pre-line leading-relaxed">
                {localAttachedSummary}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('message_placeholder')}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setHasAttachment(!hasAttachment)}
              className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                hasAttachment
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t('attach_image')}</span>
              {hasAttachment && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              type="submit"
              disabled={!question.trim()}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Send className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{t('send_question')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Previous Consultation History */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 px-1">
          <span>{t('nav_message_doctor')} ({consultations.length})</span>
        </h3>

        {consultations.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-400">
            {t('no_messages_yet')}
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((msg) => {
              const isReplied = msg.status === 'replied';
              return (
                <div key={msg.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                  {/* Question row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{child.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{formatDate(msg.sentAt)}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                        {msg.question}
                      </p>

                      {msg.structuredContext && (
                        <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                          {msg.structuredContext}
                        </div>
                      )}

                      {msg.hasAttachment && !msg.structuredContext && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300">
                          <ImageIcon className="w-3 h-3 text-emerald-400" />
                          <span>{t('attach_image')}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0 ${
                        isReplied
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isReplied ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('doctor_replied')}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{t('waiting_doctor_response')}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Doctor's Reply if available */}
                  {isReplied && msg.reply && (
                    <div className="ms-4 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                            د
                          </div>
                          <strong className="text-xs text-emerald-300">{msg.doctorName || t('founder_name')}</strong>
                        </div>
                        {msg.repliedAt && (
                          <span className="text-[10px] text-emerald-400/70 font-mono">{formatDate(msg.repliedAt)}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {msg.reply}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

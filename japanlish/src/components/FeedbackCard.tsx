import React from 'react';
import { Volume2 } from 'lucide-react';
import { VocabularyItem, KanaMode } from '../types/vocabulary';
import { soundManager } from '../utils/sound';

interface FeedbackCardProps {
  isCorrect: boolean;
  userAnswer: string;
  question: VocabularyItem;
  mode: KanaMode;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  isCorrect,
  userAnswer,
  question,
  mode,
}) => {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.speakJapanese(question.japanese || question.hiragana);
  };

  const primaryReading = mode === 'katakana' ? question.katakana : question.hiragana;
  const secondaryReadings = question.altAnswers
    ? question.altAnswers.filter(a => a !== primaryReading && a !== question.japanese)
    : [];

  if (isCorrect) {
    return (
      <div className="w-full bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-5 shadow-xs animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          {/* Left Column: ĐÚNG + Đáp án */}
          <div className="text-left">
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
              ĐÚNG
            </span>
            <div className="text-xs text-slate-500 font-medium mt-2">
              Đáp án
            </div>
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900 font-japanese tracking-wide">
                {primaryReading}
              </span>
              {question.japanese && question.japanese !== primaryReading && (
                <span className="text-base text-emerald-700 font-japanese font-semibold">
                  ({question.japanese})
                </span>
              )}
              <button
                type="button"
                onClick={handleSpeak}
                title="Nghe phát âm tiếng Nhật"
                className="text-slate-400 hover:text-emerald-700 transition-colors p-1 rounded-full hover:bg-emerald-100/70"
              >
                <Volume2 size={18} />
              </button>
            </div>
            {secondaryReadings.length > 0 && (
              <div className="text-xs text-slate-500 font-japanese mt-1">
                ({secondaryReadings.join(', ')})
              </div>
            )}
          </div>

          {/* Right Column: Bạn gõ */}
          <div className="text-right pl-4">
            <div className="text-xs text-slate-500 font-medium">
              Bạn gõ
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-japanese mt-1">
              {userAnswer || '—'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Incorrect Answer Layout — Soft red/pink light design
  return (
    <div className="w-full bg-[#FEF2F2] border border-rose-200 rounded-2xl p-5 shadow-xs animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-start justify-between">
        {/* Left Column: SAI + Đáp án */}
        <div className="text-left">
          <span className="text-[11px] font-black text-rose-700 bg-rose-100/80 border border-rose-200 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
            SAI
          </span>
          <div className="text-xs text-slate-500 font-medium mt-2">
            Đáp án
          </div>
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-japanese tracking-wide">
              {primaryReading}
            </span>
            {question.japanese && question.japanese !== primaryReading && (
              <span className="text-base text-slate-500 font-japanese font-semibold">
                ({question.japanese})
              </span>
            )}
            <button
              type="button"
              onClick={handleSpeak}
              title="Nghe phát âm tiếng Nhật"
              className="text-slate-400 hover:text-rose-700 transition-colors p-1 rounded-full hover:bg-rose-100/70"
            >
              <Volume2 size={18} />
            </button>
          </div>
          {secondaryReadings.length > 0 && (
            <div className="text-xs text-slate-500 font-japanese mt-1">
              ({secondaryReadings.join(', ')})
            </div>
          )}
        </div>

        {/* Right Column: Bạn gõ */}
        <div className="text-right pl-4">
          <div className="text-xs text-slate-500 font-medium">
            Bạn gõ
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-japanese mt-1">
            {userAnswer || '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

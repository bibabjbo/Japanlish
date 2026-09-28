import React, { useRef, useEffect } from 'react';
import { KanaMode, QuizState } from '../types/vocabulary';
import { romajiToKana } from '../utils/kanaConverter';

interface KanaInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  mode: KanaMode;
  onToggleMode: () => void;
  quizState: QuizState;
  questionIndex: number;
  emptyWarning?: boolean;
}

export const KanaInput: React.FC<KanaInputProps> = ({
  value,
  onChange,
  onSubmit,
  mode,
  onToggleMode,
  quizState,
  questionIndex,
  emptyWarning = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isAnswering = quizState === 'ANSWERING';

  // Guaranteed auto-focus whenever in ANSWERING state or questionIndex changes
  useEffect(() => {
    if (isAnswering) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAnswering, questionIndex]);

  // Handle live conversion as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAnswering) return;
    const rawVal = e.target.value;
    const converted = romajiToKana(rawVal, mode, true);
    onChange(converted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab toggles between Hiragana and Katakana
    if (e.key === 'Tab') {
      e.preventDefault();
      onToggleMode();
      return;
    }

    // Enter submits answer during ANSWERING state
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (!isAnswering) return;
      onSubmit();
    }
  };

  const getBorderAndRingStyles = () => {
    if (quizState === 'CORRECT_FEEDBACK') {
      return 'border-emerald-400 ring-4 ring-emerald-500/15 bg-white';
    }
    if (quizState === 'INCORRECT_FEEDBACK') {
      return 'border-rose-400 ring-4 ring-rose-500/15 bg-white';
    }
    if (emptyWarning) {
      return 'border-amber-400 ring-4 ring-amber-500/20 bg-white animate-pulse';
    }
    return 'border-[#D7EEF9] hover:border-sky-300 focus-within:border-[#5BC0EB] focus-within:ring-4 focus-within:ring-[#5BC0EB]/15 bg-white shadow-xs';
  };

  return (
    <div className="w-full relative group">
      <div
        onClick={() => {
          if (isAnswering) inputRef.current?.focus();
        }}
        className={`w-full rounded-2xl transition-all duration-150 cursor-text flex items-center justify-center min-h-[88px] sm:min-h-[96px] px-6 py-4 border-2 ${getBorderAndRingStyles()}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={!isAnswering}
          placeholder={isAnswering ? 'ひらがな | カタカナ' : ''}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className="w-full bg-transparent text-center text-[#1F2937] text-3xl sm:text-4xl font-extrabold tracking-wide font-japanese outline-none placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal selection:bg-[#E8F7FF] selection:text-[#0284c7] disabled:opacity-100 disabled:text-[#1F2937]"
        />
      </div>
    </div>
  );
};

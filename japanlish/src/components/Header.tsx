import React from 'react';
import { Volume2, VolumeX, HelpCircle, X } from 'lucide-react';
import { formatTime } from '../utils/kanaConverter';

interface HeaderProps {
  currentIndex: number;
  totalQuestions: number;
  timeSeconds: number;
  onExit: () => void;
  onOpenGuide: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentIndex,
  totalQuestions,
  timeSeconds,
  onExit,
  onOpenGuide,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between select-none">
      {/* Left: Mode label & Progress */}
      <div className="flex flex-col items-start">
        <span className="text-[11px] font-bold text-[#0284c7] tracking-widest uppercase">
          VIỆT → NHẬT
        </span>
        <span className="text-xl font-extrabold text-[#1F2937] tracking-tight tabular-nums mt-0.5">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Center: Timer */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-semibold text-[#64748B] tracking-widest uppercase">
          THỜI GIAN
        </span>
        <span className="text-sm font-semibold font-mono text-[#1F2937] tabular-nums mt-0.5">
          {formatTime(timeSeconds)}
        </span>
      </div>

      {/* Right: Sound toggle, Guide, Exit */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          type="button"
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          className="p-1.5 text-slate-500 hover:text-[#0284c7] transition-colors rounded-full hover:bg-[#E8F7FF]"
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <button
          onClick={onOpenGuide}
          type="button"
          title="Bảng tra cứu Romaji"
          className="p-1.5 text-slate-500 hover:text-[#0284c7] transition-colors rounded-full hover:bg-[#E8F7FF]"
        >
          <HelpCircle size={16} />
        </button>

        <button
          onClick={onExit}
          type="button"
          className="text-xs font-semibold text-slate-600 hover:text-[#1F2937] border border-[#D7EEF9] hover:border-sky-300 bg-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
        >
          <X size={13} className="text-slate-400" />
          <span>Thoát</span>
        </button>
      </div>
    </header>
  );
};

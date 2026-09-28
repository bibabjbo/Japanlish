import React from 'react';
import { KanaMode } from '../types/vocabulary';

interface ModeSelectorProps {
  mode: KanaMode;
  onChangeMode: (newMode: KanaMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onChangeMode,
  disabled = false,
}) => {
  return (
    <div className="w-full bg-white border border-[#D7EEF9] rounded-xl px-4 py-2 flex items-center justify-between shadow-xs">
      <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">
        BỘ GÕ TRONG APP
      </span>

      <div className="flex items-center gap-1 bg-[#F0F9FF] p-1 rounded-lg border border-[#D7EEF9]">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('hiragana')}
          className={`px-3 py-1 rounded text-xs font-bold transition-all font-japanese flex items-center gap-1 cursor-pointer ${
            mode === 'hiragana'
              ? 'bg-[#E8F7FF] text-[#0284c7] border border-[#5BC0EB] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 border border-transparent'
          }`}
          title="Bộ gõ Hiragana (Phím tắt: Tab)"
        >
          <span className="font-extrabold">あ</span>
          <span className="text-[10px] font-sans font-medium opacity-90 hidden sm:inline">Hiragana</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeMode('katakana')}
          className={`px-3 py-1 rounded text-xs font-bold transition-all font-japanese flex items-center gap-1 cursor-pointer ${
            mode === 'katakana'
              ? 'bg-[#E8F7FF] text-[#0284c7] border border-[#5BC0EB] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 border border-transparent'
          }`}
          title="Bộ gõ Katakana (Phím tắt: Tab)"
        >
          <span className="font-extrabold">ア</span>
          <span className="text-[10px] font-sans font-medium opacity-90 hidden sm:inline">Katakana</span>
        </button>
      </div>
    </div>
  );
};

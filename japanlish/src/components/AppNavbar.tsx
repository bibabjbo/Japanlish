import React from 'react';
import { Sparkles, Database, Play, HelpCircle } from 'lucide-react';

interface AppNavbarProps {
  currentTab: 'home' | 'bank';
  onSelectTab: (tab: 'home' | 'bank') => void;
  bankWordCount: number;
  onOpenGuide: () => void;
  onOpenStartLearningModal: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  currentTab,
  onSelectTab,
  bankWordCount,
  onOpenGuide,
  onOpenStartLearningModal,
}) => {
  return (
    <header className="w-full border-b border-[#D7EEF9] bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#E8F7FF] border border-[#D7EEF9] flex items-center justify-center text-[#0284c7] group-hover:scale-105 transition-transform shadow-sm">
            <span className="font-japanese font-bold text-sm">言</span>
          </div>
          <div>
            <div className="font-extrabold text-[#1F2937] text-base tracking-tight font-japanese flex items-center gap-1.5">
              <span>Japanlish</span>
              <span className="text-[#0284c7] text-xs font-light">言葉</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-[#F0F9FF] p-1 rounded-xl border border-[#D7EEF9]">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'home'
                ? 'bg-white text-[#0284c7] shadow-sm border border-[#D7EEF9]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={13} />
            <span>Luyện gõ</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('bank')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'bank'
                ? 'bg-white text-[#0284c7] shadow-sm border border-[#D7EEF9]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database size={13} />
            <span>Kho từ vựng</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-[#E8F7FF] text-[#0284c7] font-mono font-semibold">
              {bankWordCount}
            </span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenGuide}
            title="Hướng dẫn gõ Romaji"
            className="p-2 rounded-xl text-slate-500 hover:text-[#0284c7] hover:bg-[#E8F7FF] transition-colors"
          >
            <HelpCircle size={18} />
          </button>

          <button
            type="button"
            onClick={onOpenStartLearningModal}
            className="hidden sm:flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white font-bold text-xs transition-all shadow-sm active:scale-[0.98]"
          >
            <Play size={13} fill="currentColor" />
            <span>Bắt đầu học</span>
          </button>
        </div>
      </div>
    </header>
  );
};

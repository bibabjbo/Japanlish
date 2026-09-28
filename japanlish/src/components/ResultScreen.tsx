import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  Volume2,
  Award,
  Clock,
  Database,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizStats } from '../types/vocabulary';
import { soundManager } from '../utils/sound';

interface ResultScreenProps {
  stats: QuizStats;
  onRestart: (missedOnly?: boolean) => void;
  onGoHome: () => void;
  onGoToBank?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stats,
  onRestart,
  onGoHome,
  onGoToBank,
}) => {
  const [filter, setFilter] = useState<'all' | 'incorrect'>('all');

  useEffect(() => {
    // Launch celebratory confetti if good accuracy
    if (stats.accuracy >= 70) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Safe fallback
      }
    }
  }, [stats.accuracy]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSpeak = (text: string) => {
    soundManager.speakJapanese(text);
  };

  const incorrectResults = stats.results.filter((r) => !r.isCorrect);
  const displayedItems = filter === 'all' ? stats.results : incorrectResults;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[85vh] animate-in fade-in duration-300">
      {/* Top Completion Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F7FF] border border-[#D7EEF9] text-[#0284c7] text-xs font-semibold uppercase tracking-wider mb-2 shadow-xs">
          <Award size={14} />
          Hoàn thành phiên luyện tập
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1F2937] tracking-tight font-japanese">
          KẾT QUẢ
        </h1>
        <p className="text-[#64748B] text-xs sm:text-sm mt-1">
          Tiến độ học tập và độ chính xác đã được cập nhật vào Kho từ vựng
        </p>
      </div>

      {/* Main Stats Card: 20 câu | 16 đúng | 4 sai | Accuracy: 80% */}
      <div className="w-full bg-white border border-[#D7EEF9] rounded-2xl p-6 shadow-xs mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#F8FCFF] border border-[#D7EEF9] rounded-xl p-3">
            <span className="text-xs text-[#64748B] font-semibold block">Tổng số</span>
            <span className="text-2xl font-black text-[#1F2937] block mt-0.5">{stats.total} câu</span>
          </div>

          <div className="bg-[#F0FDF4] border border-emerald-200 rounded-xl p-3">
            <span className="text-xs text-emerald-700 font-semibold block">Đúng</span>
            <span className="text-2xl font-black text-emerald-600 block mt-0.5">{stats.correct}</span>
          </div>

          <div className="bg-[#FEF2F2] border border-rose-200 rounded-xl p-3">
            <span className="text-xs text-rose-700 font-semibold block">Sai</span>
            <span className="text-2xl font-black text-rose-600 block mt-0.5">{stats.incorrect}</span>
          </div>

          <div className="bg-[#E8F7FF] border border-sky-200 rounded-xl p-3">
            <span className="text-xs text-[#0284c7] font-semibold block">Accuracy</span>
            <span className="text-2xl font-black text-[#0284c7] block mt-0.5">{stats.accuracy}%</span>
          </div>
        </div>

        {/* Time spent */}
        <div className="mt-4 pt-3 border-t border-[#D7EEF9] flex items-center justify-between text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#0284c7]" />
            Thời gian làm bài:
          </span>
          <span className="font-mono font-bold text-[#1F2937] text-sm">
            {formatTime(stats.timeSpentSeconds)}
          </span>
        </div>
      </div>

      {/* 3. WRONG WORD REVIEW: TỪ CẦN ÔN LẠI */}
      {incorrectResults.length > 0 && (
        <div className="w-full bg-[#FEF2F2] border border-rose-200 rounded-2xl p-5 sm:p-6 shadow-xs mb-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-rose-200 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-200/80 text-rose-700 flex items-center justify-center">
                <AlertOctagon size={14} />
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-rose-900 tracking-wider uppercase">
                TỪ CẦN ÔN LẠI ({incorrectResults.length})
              </h2>
            </div>
            <span className="text-xs text-rose-700 font-medium">
              Cần luyện tập thêm để nâng độ chính xác
            </span>
          </div>

          {/* List of wrong words */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5 max-h-56 overflow-y-auto pr-1">
            {incorrectResults.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-rose-200 rounded-xl p-3 flex items-center justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#1F2937] font-japanese">
                      {item.question.japanese}
                    </span>
                    <span className="text-xs text-rose-700 font-japanese font-semibold">
                      {item.question.hiragana}
                    </span>
                  </div>
                  <div className="text-xs text-[#64748B] font-medium mt-0.5">
                    {item.question.vietnamese}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Bạn gõ: <span className="font-japanese text-rose-600 font-bold">{item.userAnswer || '—'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpeak(item.question.japanese || item.question.hiragana)}
                  title="Nghe phát âm"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  <Volume2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Prominent [ ÔN LẠI TỪ SAI ] Button */}
          <button
            type="button"
            onClick={() => onRestart(true)}
            className="w-full py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>ÔN LẠI TỪ SAI ({incorrectResults.length} từ)</span>
          </button>
        </div>
      )}

      {/* If 100% correct, celebratory banner */}
      {incorrectResults.length === 0 && (
        <div className="w-full bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-5 text-center mb-6 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Sparkles size={20} />
          </div>
          <h3 className="text-base font-bold text-emerald-950">Xuất sắc! Bạn không sai từ nào</h3>
          <p className="text-xs text-emerald-700 mt-1">
            Toàn bộ các từ trong phiên này đã đạt độ chính xác tối đa.
          </p>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-2.5 mb-8">
        <button
          type="button"
          onClick={() => onRestart(false)}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
        >
          <RotateCcw size={15} />
          Làm lại bài này
        </button>

        {onGoToBank && (
          <button
            type="button"
            onClick={onGoToBank}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white hover:bg-[#E8F7FF] text-[#0284c7] font-bold text-xs sm:text-sm border border-[#D7EEF9] flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-xs cursor-pointer"
          >
            <Database size={15} />
            Kho từ vựng
          </button>
        )}

        <button
          type="button"
          onClick={onGoHome}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-[#D7EEF9] flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-xs cursor-pointer"
        >
          <Home size={15} />
          Trang chủ
        </button>
      </div>

      {/* Detailed Review Section */}
      <div className="w-full bg-white border border-[#D7EEF9] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D7EEF9]">
          <h3 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider">
            Chi tiết câu trả lời
          </h3>

          <div className="flex items-center gap-1 bg-[#F0F9FF] p-1 rounded-lg border border-[#D7EEF9] text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'all'
                  ? 'bg-white text-[#0284c7] font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({stats.results.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'incorrect'
                  ? 'bg-rose-100 text-rose-700 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Từ sai ({incorrectResults.length})
            </button>
          </div>
        </div>

        {displayedItems.length === 0 ? (
          <p className="text-center text-[#64748B] text-sm py-6">
            Không có từ nào trong danh mục này!
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {displayedItems.map((res, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
                  res.isCorrect
                    ? 'bg-[#F0FDF4] border-emerald-200 text-[#1F2937]'
                    : 'bg-[#FEF2F2] border-rose-200 text-[#1F2937]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {res.isCorrect ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <XCircle size={16} className="text-rose-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-[#1F2937] font-japanese text-sm sm:text-base">
                        {res.question.japanese}
                      </span>
                      <span className="text-xs font-japanese text-[#64748B]">
                        ({res.question.hiragana})
                      </span>
                    </div>

                    <div className="text-xs text-[#64748B] font-medium mt-0.5">
                      {res.question.vietnamese}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                      <span>Bạn gõ: </span>
                      <span
                        className={`font-bold font-japanese ${
                          res.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {res.userAnswer || '(bỏ trống)'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpeak(res.question.japanese || res.question.hiragana)}
                  title="Nghe phát âm"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-white/80 transition-colors"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

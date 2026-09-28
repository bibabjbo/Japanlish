import React from 'react';
import { Play, Sparkles, Clock, HelpCircle, Database, Shuffle, ListOrdered, Upload, AlertCircle } from 'lucide-react';
import { KanaMode, QuizOptions } from '../types/vocabulary';

interface StartScreenProps {
  onStartQuiz: (options: QuizOptions) => void;
  onOpenGuide: () => void;
  onOpenBank: () => void;
  onOpenImportCsv: () => void;
  totalAvailableWords: number;
  categories: string[];
  needsReviewCount?: number;
  recentMistakesCount?: number;
  onStartReviewNeedsReview?: () => void;
  onStartReviewRecentIncorrect?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartQuiz,
  onOpenGuide,
  onOpenBank,
  onOpenImportCsv,
  totalAvailableWords,
  categories,
  needsReviewCount = 0,
  recentMistakesCount = 0,
  onStartReviewNeedsReview,
  onStartReviewRecentIncorrect,
}) => {
  // Default questionCount tests all words in the CSV pool
  const [questionCount, setQuestionCount] = React.useState<number>(
    totalAvailableWords > 0 ? totalAvailableWords : 0
  );
  const [initialMode, setInitialMode] = React.useState<KanaMode>('hiragana');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [order, setOrder] = React.useState<'random' | 'original'>('random');

  // Keep question count synced if CSV pool size changes
  React.useEffect(() => {
    setQuestionCount(totalAvailableWords > 0 ? totalAvailableWords : 0);
  }, [totalAvailableWords]);

  const handleStart = () => {
    if (totalAvailableWords === 0) {
      onOpenImportCsv();
      return;
    }

    onStartQuiz({
      questionCount: questionCount > 0 ? questionCount : totalAvailableWords,
      initialMode,
      category: selectedCategory,
      order,
    });
  };

  // Build question count options based on the actual CSV pool size
  const buildCountOptions = () => {
    if (totalAvailableWords <= 0) return [];
    if (totalAvailableWords <= 10) {
      return [{ label: `Tất cả (${totalAvailableWords} câu)`, val: totalAvailableWords }];
    }
    const opts = [{ label: '10 câu', val: 10 }];
    if (totalAvailableWords >= 20) {
      opts.push({ label: '20 câu', val: 20 });
    }
    if (totalAvailableWords >= 50) {
      opts.push({ label: '50 câu', val: 50 });
    }
    opts.push({ label: `Tất cả (${totalAvailableWords} câu)`, val: totalAvailableWords });
    return opts;
  };

  const countOptions = buildCountOptions();

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[85vh] animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F7FF] border border-[#D7EEF9] text-[#0284c7] text-xs font-semibold uppercase tracking-wider mb-3 shadow-xs">
          <Sparkles size={13} />
          Luyện gõ từ vựng tiếng Nhật
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#1F2937] tracking-tight font-japanese mb-2">
          Japanlish <span className="text-[#5BC0EB] text-2xl font-sans font-light">言葉</span>
        </h1>
        <p className="text-[#64748B] text-xs sm:text-sm max-w-md mx-auto">
          Nhìn nghĩa tiếng Việt, gõ Romaji trên bàn phím tiếng Anh thông thường — tự động chuyển sang Hiragana và Katakana theo thời gian thực.
        </p>
      </div>

      {/* Settings Card */}
      <div className="w-full bg-white border border-[#D7EEF9] rounded-2xl p-6 shadow-sm space-y-5">
        {/* CSV Source Status Header */}
        {totalAvailableWords === 0 ? (
          /* Empty CSV Notice - Mandatory Prompt Requirement */
          <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div>
                <div className="font-bold text-sm text-amber-900">
                  Vui lòng nhập file CSV để bắt đầu luyện tập.
                </div>
                <div className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Ứng dụng chỉ sử dụng các từ vựng có trong file CSV của bạn. Chưa có từ vựng nào được nạp.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenImportCsv}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <Upload size={14} />
              <span>Nhập file CSV ngay</span>
            </button>
          </div>
        ) : (
          /* CSV Pool Active Status */
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FCFF] border border-[#D7EEF9]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E8F7FF] border border-[#D7EEF9] flex items-center justify-center text-[#0284c7]">
                <Database size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1F2937]">Nguồn: File CSV đã nhập</div>
                <div className="text-[11px] text-[#64748B]">
                  Hiện có <strong className="text-[#0284c7] font-semibold">{totalAvailableWords}</strong> từ trong danh sách CSV
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenImportCsv}
                className="py-1.5 px-3 rounded-lg bg-white hover:bg-[#E8F7FF] text-[#0284c7] text-xs font-bold transition-all border border-[#D7EEF9] active:scale-[0.98] shadow-xs cursor-pointer"
              >
                Đổi file CSV
              </button>
              <button
                type="button"
                onClick={onOpenBank}
                className="py-1.5 px-2.5 rounded-lg text-[#64748B] hover:text-[#1F2937] hover:bg-[#F0F9FF] text-xs transition-colors"
                title="Xem danh sách từ"
              >
                Xem
              </button>
            </div>
          </div>
        )}

        {/* Quick Review Mode Actions (only when words exist) */}
        {totalAvailableWords > 0 && (needsReviewCount > 0 || recentMistakesCount > 0) && (
          <div className="p-3.5 rounded-xl bg-[#F8FCFF] border border-[#D7EEF9] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1F2937] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5BC0EB] animate-pulse" />
                Chế độ ôn tập mục tiêu
              </span>
              <span className="text-[11px] text-[#64748B]">
                Luyện từ yếu trong file CSV
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {onStartReviewNeedsReview && needsReviewCount > 0 && (
                <button
                  type="button"
                  onClick={onStartReviewNeedsReview}
                  className="py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>ÔN TỪ CẦN ÔN</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 text-rose-800 font-mono">
                    {needsReviewCount} từ
                  </span>
                </button>
              )}

              {onStartReviewRecentIncorrect && recentMistakesCount > 0 && (
                <button
                  type="button"
                  onClick={onStartReviewRecentIncorrect}
                  className="py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>ÔN TỪ SAI GẦN ĐÂY</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-mono">
                    {recentMistakesCount} từ
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div>
          <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-2">
            Bộ gõ mặc định
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setInitialMode('hiragana')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                initialMode === 'hiragana'
                  ? 'bg-[#E8F7FF] border-[#5BC0EB] text-[#0284c7] shadow-xs'
                  : 'bg-white border-[#D7EEF9] text-slate-600 hover:border-sky-300'
              }`}
            >
              <span>Hiragana (ひらがな)</span>
            </button>
            <button
              type="button"
              onClick={() => setInitialMode('katakana')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                initialMode === 'katakana'
                  ? 'bg-[#E8F7FF] border-[#5BC0EB] text-[#0284c7] shadow-xs'
                  : 'bg-white border-[#D7EEF9] text-slate-600 hover:border-sky-300'
              }`}
            >
              <span>Katakana (カタカナ)</span>
            </button>
          </div>
        </div>

        {/* Question Count Selector (Tailored to CSV word count) */}
        {totalAvailableWords > 0 && countOptions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                Số lượng câu hỏi
              </label>
              <span className="text-[11px] text-[#64748B]">
                (Tối đa {totalAvailableWords} từ trong file CSV)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {countOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setQuestionCount(opt.val)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    questionCount === opt.val
                      ? 'bg-[#E8F7FF] border-[#5BC0EB] text-[#0284c7] font-bold shadow-xs'
                      : 'bg-white border-[#D7EEF9] text-slate-600 hover:border-sky-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order Selector */}
        <div>
          <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-2">
            Thứ tự xuất hiện
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrder('random')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                order === 'random'
                  ? 'bg-[#E8F7FF] border-[#5BC0EB] text-[#0284c7] font-bold shadow-xs'
                  : 'bg-white border-[#D7EEF9] text-slate-600 hover:border-sky-300'
              }`}
            >
              <Shuffle size={13} />
              <span>Ngẫu nhiên</span>
            </button>

            <button
              type="button"
              onClick={() => setOrder('original')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                order === 'original'
                  ? 'bg-[#E8F7FF] border-[#5BC0EB] text-[#0284c7] font-bold shadow-xs'
                  : 'bg-white border-[#D7EEF9] text-slate-600 hover:border-sky-300'
              }`}
            >
              <ListOrdered size={13} />
              <span>Thứ tự file CSV</span>
            </button>
          </div>
        </div>

        {/* Category Filter (if multiple categories in CSV) */}
        {categories.length > 1 && (
          <div>
            <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-2">
              Chủ đề từ vựng
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-[#D7EEF9] rounded-xl px-4 py-2.5 text-xs text-[#1F2937] outline-none focus:border-[#5BC0EB] focus:ring-2 focus:ring-[#5BC0EB]/20"
            >
              <option value="all">Tất cả chủ đề trong file ({totalAvailableWords} từ)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Start Button */}
        <button
          type="button"
          onClick={handleStart}
          className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] mt-2 cursor-pointer ${
            totalAvailableWords === 0
              ? 'bg-slate-200 text-slate-400 border border-slate-300'
              : 'bg-[#5BC0EB] hover:bg-[#38bdf8] text-white shadow-sky-500/20'
          }`}
        >
          <Play size={18} fill="currentColor" />
          <span>Bắt đầu luyện tập</span>
        </button>

        {/* Footer Helper */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D7EEF9] text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            <span>Có đếm giờ làm bài</span>
          </div>

          <button
            type="button"
            onClick={onOpenGuide}
            className="text-[#0284c7] hover:text-sky-700 flex items-center gap-1 hover:underline font-medium cursor-pointer"
          >
            <HelpCircle size={13} />
            <span>Hướng dẫn gõ Romaji</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Play, Shuffle, ListOrdered, Upload, AlertCircle } from 'lucide-react';
import { KanaMode, QuizOptions } from '../types/vocabulary';

interface StartLearningModalProps {
  isOpen: boolean;
  totalWords: number;
  availableCategories: string[];
  onClose: () => void;
  onConfirmStart: (options: QuizOptions) => void;
  onOpenImportCsv?: () => void;
}

export const StartLearningModal: React.FC<StartLearningModalProps> = ({
  isOpen,
  totalWords,
  availableCategories,
  onClose,
  onConfirmStart,
  onOpenImportCsv,
}) => {
  const [selectedCount, setSelectedCount] = useState<number | 'all'>(
    totalWords > 0 ? totalWords : 'all'
  );
  const [mode, setMode] = useState<KanaMode>('hiragana');
  const [order, setOrder] = useState<'random' | 'original'>('random');
  const [category, setCategory] = useState<string>('all');

  if (!isOpen) return null;

  const buildCountOptions = () => {
    if (totalWords <= 0) return [];
    if (totalWords <= 10) {
      return [{ label: `Tất cả (${totalWords} câu)`, value: totalWords }];
    }
    const list: { label: string; value: number | 'all' }[] = [{ label: '10 câu', value: 10 }];
    if (totalWords >= 20) list.push({ label: '20 câu', value: 20 });
    if (totalWords >= 50) list.push({ label: '50 câu', value: 50 });
    list.push({ label: `Tất cả (${totalWords})`, value: totalWords });
    return list;
  };

  const countOptions = buildCountOptions();

  const handleStart = () => {
    if (totalWords === 0) {
      if (onOpenImportCsv) {
        onClose();
        onOpenImportCsv();
      }
      return;
    }

    const finalCount = selectedCount === 'all' ? totalWords : Math.min(Number(selectedCount), totalWords);
    onConfirmStart({
      questionCount: finalCount > 0 ? finalCount : totalWords,
      initialMode: mode,
      category,
      order,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#D7EEF9] rounded-2xl max-w-md w-full p-6 text-[#1F2937] shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D7EEF9] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8F7FF] text-[#0284c7] border border-[#D7EEF9]">
              <Play size={20} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1F2937]">Bắt đầu học từ vựng</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {totalWords > 0
                  ? `Thiết lập bài luyện gõ từ ${totalWords} từ trong file CSV`
                  : 'Chưa có từ vựng nào trong kho'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#F0F9FF] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {totalWords === 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 mb-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div>
                <div className="font-bold text-sm text-amber-900">
                  Vui lòng nhập file CSV để bắt đầu luyện tập.
                </div>
                <div className="text-xs text-amber-800 mt-0.5">
                  Bạn cần nhập một file CSV chứa từ vựng để tạo bài luyện tập.
                </div>
              </div>
            </div>
            {onOpenImportCsv && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImportCsv();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Upload size={14} />
                <span>Nhập file CSV ngay</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mode selection */}
            <div>
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-2">
                Bộ gõ
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('hiragana')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    mode === 'hiragana'
                      ? 'bg-[#E8F7FF] border-[#5BC0EB] text-[#0284c7] shadow-xs'
                      : 'bg-white border-[#D7EEF9] text-slate-600 hover:border-sky-300'
                  }`}
                >
                  Hiragana (ひらがな)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('katakana')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    mode === 'katakana'
                      ? 'bg-[#E8F7FF] border-[#5BC0EB] text-[#0284c7] shadow-xs'
                      : 'bg-white border-[#D7EEF9] text-slate-600 hover:border-sky-300'
                  }`}
                >
                  Katakana (カタカナ)
                </button>
              </div>
            </div>

            {/* Question count */}
            {countOptions.length > 0 && (
              <div>
                <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-2">
                  Số lượng câu hỏi (từ file CSV: {totalWords} từ)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {countOptions.map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setSelectedCount(opt.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedCount === opt.value
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

            {/* Order */}
            <div>
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-2">
                Thứ tự
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

            {/* Categories */}
            {availableCategories.length > 1 && (
              <div>
                <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-2">
                  Chủ đề
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#D7EEF9] rounded-xl px-4 py-2.5 text-xs text-[#1F2937] outline-none focus:border-[#5BC0EB] focus:ring-2 focus:ring-[#5BC0EB]/20"
                >
                  <option value="all">Tất cả chủ đề trong file</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-5 border-t border-[#D7EEF9] mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#D7EEF9] text-[#64748B] hover:text-[#1F2937] hover:bg-[#F0F9FF] text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={totalWords === 0}
            onClick={handleStart}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            Bắt đầu luyện
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#D7EEF9] rounded-2xl max-w-xl w-full p-6 text-[#1F2937] shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-[#E8F7FF] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#E8F7FF] border border-[#D7EEF9] flex items-center justify-center text-[#0284c7]">
            <Keyboard size={18} />
          </div>
          <h3 className="text-lg font-bold text-[#1F2937]">Hướng dẫn gõ Romaji sang Kana</h3>
        </div>

        <p className="text-sm text-[#64748B] mb-4">
          Bạn chỉ cần dùng bàn phím tiếng Anh thông thường. Ứng dụng sẽ tự động chuyển đổi sang Hiragana hoặc Katakana theo thời gian thực!
        </p>

        <div className="space-y-4 text-sm">
          {/* Section 1 */}
          <div className="bg-[#F8FCFF] p-3.5 rounded-xl border border-[#D7EEF9]">
            <h4 className="font-bold text-[#0284c7] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={14} />
              Quy tắc gõ đặc biệt
            </h4>
            <ul className="space-y-2 text-xs text-[#1F2937]">
              <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-[#D7EEF9] gap-1">
                <span className="text-[#64748B]">Âm ngắt (Chữ っ nhỏ): Gõ lặp đôi phụ âm</span>
                <span className="font-mono text-[#0284c7] bg-white px-2 py-0.5 rounded border border-[#D7EEF9] font-semibold text-[11px] self-start sm:self-auto">
                  gakkou → がっこう, kitte → きって
                </span>
              </li>
              <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-[#D7EEF9] gap-1">
                <span className="text-[#64748B]">Chữ ん: Gõ <code className="text-[#0284c7] font-bold">n</code> hoặc <code className="text-[#0284c7] font-bold">nn</code></span>
                <span className="font-mono text-[#0284c7] bg-white px-2 py-0.5 rounded border border-[#D7EEF9] font-semibold text-[11px] self-start sm:self-auto">
                  hon → ほん, nihon → にほん
                </span>
              </li>
              <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-[#D7EEF9] gap-1">
                <span className="text-[#64748B]">Trường âm Katakana: Gõ dấu gạch nối <code className="text-[#0284c7] font-bold">-</code></span>
                <span className="font-mono text-[#0284c7] bg-white px-2 py-0.5 rounded border border-[#D7EEF9] font-semibold text-[11px] self-start sm:self-auto">
                  ko-hi- → コーヒー
                </span>
              </li>
              <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 gap-1">
                <span className="text-[#64748B]">Âm ghép (Ảo âm): Gõ liên tiếp</span>
                <span className="font-mono text-[#0284c7] bg-white px-2 py-0.5 rounded border border-[#D7EEF9] font-semibold text-[11px] self-start sm:self-auto">
                  sha → しゃ, ryo → りょ, kyo → きょ
                </span>
              </li>
            </ul>
          </div>

          {/* Section 2: Shortcuts */}
          <div className="bg-[#F8FCFF] p-3.5 rounded-xl border border-[#D7EEF9]">
            <h4 className="font-bold text-[#0284c7] text-xs uppercase tracking-wider mb-2">
              Phím tắt nhanh
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-[#D7EEF9] flex items-center justify-between">
                <span className="text-[#64748B]">Chuyển Hiragana / Katakana</span>
                <kbd className="bg-[#E8F7FF] border border-[#D7EEF9] px-2 py-0.5 rounded text-[#0284c7] font-mono font-bold shadow-xs">Tab</kbd>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#D7EEF9] flex items-center justify-between">
                <span className="text-[#64748B]">Kiểm tra / Sang từ kế tiếp</span>
                <kbd className="bg-[#E8F7FF] border border-[#D7EEF9] px-2 py-0.5 rounded text-[#0284c7] font-mono font-bold shadow-xs">Enter</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, AlertTriangle, X, Play } from 'lucide-react';
import { CsvImportResult } from '../types/vocabulary';

interface ImportResultModalProps {
  isOpen: boolean;
  result: CsvImportResult | null;
  onClose: () => void;
  onStartLearning: () => void;
}

export const ImportResultModal: React.FC<ImportResultModalProps> = ({
  isOpen,
  result,
  onClose,
  onStartLearning,
}) => {
  if (!isOpen || !result) return null;

  const needsReviewCount = result.importedItems.filter(item => item.needsReview).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#D7EEF9] rounded-2xl max-w-lg w-full p-6 text-[#1F2937] shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D7EEF9] mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              result.successCount > 0
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1F2937]">Kết quả nhập từ vựng</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Báo cáo xử lý và nhận diện từ vựng từ tệp CSV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#E8F7FF] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-[#F8FCFF] border border-[#D7EEF9] rounded-xl p-3.5 text-center">
            <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Tổng số dòng
            </div>
            <div className="text-2xl font-black text-[#1F2937] mt-1">
              {result.totalRows}
            </div>
          </div>

          <div className="bg-[#F0FDF4] border border-emerald-200 rounded-xl p-3.5 text-center">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Thành công
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {result.successCount}
            </div>
          </div>

          <div className="bg-[#FEF2F2] border border-rose-200 rounded-xl p-3.5 text-center">
            <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Đã bỏ qua
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {result.skippedCount}
            </div>
          </div>
        </div>

        {/* Notice if items need manual review */}
        {needsReviewCount > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-amber-600" />
              <span>
                Có <strong>{needsReviewCount}</strong> từ cần duyệt cách đọc thủ công trong kho.
              </span>
            </div>
          </div>
        )}

        {/* Skipped Rows Breakdown */}
        {result.skippedDetails.length > 0 && (
          <div className="mb-5 space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-rose-500" />
              <span>Chi tiết các dòng bị bỏ qua ({result.skippedDetails.length}):</span>
            </div>

            <div className="bg-[#F8FCFF] border border-[#D7EEF9] rounded-xl max-h-44 overflow-y-auto divide-y divide-[#D7EEF9] p-2 text-xs">
              {result.skippedDetails.map((item, idx) => (
                <div key={idx} className="py-2 px-2 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[#0284c7] font-semibold mr-1.5">
                      Dòng {item.rowNumber}:
                    </span>
                    <span className="text-slate-700 font-japanese">
                      {item.rawContent.length > 30 ? `${item.rawContent.substring(0, 30)}...` : item.rawContent}
                    </span>
                  </div>
                  <span className="text-rose-600 text-[11px] shrink-0 font-medium">
                    {item.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D7EEF9]">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
          >
            Đóng & Xem kho
          </button>

          {result.successCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartLearning();
              }}
              className="py-2.5 px-5 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white text-xs font-bold transition-all shadow-xs active:scale-[0.99] flex items-center gap-1.5 cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              <span>Bắt đầu học ngay ({result.successCount} từ)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ExitModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#D7EEF9] rounded-2xl max-w-sm w-full p-6 text-[#1F2937] shadow-xl text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={26} />
        </div>

        <h3 className="text-lg font-bold text-[#1F2937] mb-2">Thoát phiên luyện tập?</h3>
        <p className="text-sm text-[#64748B] mb-6">
          Tiến độ của bài kiểm tra hiện tại sẽ không được lưu. Bạn có chắc muốn quay về màn hình chính?
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            Tiếp tục học
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Thoát ra
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Download, AlertTriangle, FileCode } from 'lucide-react';
import { CsvImportResult } from '../types/vocabulary';
import { parseAndValidateCsv } from '../utils/csvParser';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted: (result: CsvImportResult) => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImportCompleted,
}) => {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const sampleCsv = `Nghĩa tiếng Việt,Từ tiếng Nhật,Hiragana,Katakana,Romaji
Hôm nay,今日,きょう,キョウ,kyou
Ngày mai,明日,あした,アシタ,ashita
Xe đạp,自転車,じてんしゃ,ジテンシャ,jitensha`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'japanlish_sample_vocabulary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text || !text.trim()) {
        setError('Tệp CSV rỗng hoặc không có dữ liệu hợp lệ.');
        return;
      }
      setFileContent(text);
    };

    reader.onerror = () => {
      setError('Không thể đọc tệp đã chọn. Vui lòng thử lại.');
    };

    reader.readAsText(file, 'utf-8');
  };

  const handleProcessImport = () => {
    setError(null);
    const contentToProcess = tab === 'upload' ? fileContent : pasteContent;

    if (!contentToProcess || !contentToProcess.trim()) {
      setError(
        tab === 'upload'
          ? 'Vui lòng chọn hoặc kéo thả một tệp CSV hợp lệ.'
          : 'Vui lòng nhập hoặc dán nội dung từ vựng vào ô văn bản.'
      );
      return;
    }

    try {
      const result = parseAndValidateCsv(contentToProcess);
      onImportCompleted(result);
      onClose();
    } catch (err) {
      console.error('CSV import error:', err);
      setError('Đã xảy ra lỗi khi xử lý tệp CSV. Vui lòng kiểm tra định dạng tệp.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#D7EEF9] rounded-2xl max-w-xl w-full p-6 text-[#1F2937] shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D7EEF9] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8F7FF] text-[#0284c7] border border-[#D7EEF9]">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1F2937]">Nhập từ vựng từ file CSV</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Các từ vựng trong file sẽ được dùng làm bộ câu hỏi duy nhất cho quiz (thay thế bộ từ cũ).
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

        {/* Tab switch */}
        <div className="flex rounded-xl bg-[#F0F9FF] p-1 border border-[#D7EEF9] mb-5">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'upload'
                ? 'bg-white text-[#0284c7] shadow-xs border border-[#D7EEF9]'
                : 'text-[#64748B] hover:text-[#1F2937]'
            }`}
          >
            <Upload size={14} />
            <span>Tải lên tệp .csv</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('paste')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'paste'
                ? 'bg-white text-[#0284c7] shadow-xs border border-[#D7EEF9]'
                : 'text-[#64748B] hover:text-[#1F2937]'
            }`}
          >
            <FileCode size={14} />
            <span>Dán trực tiếp văn bản</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Zone */}
        {tab === 'upload' ? (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D7EEF9] hover:border-[#5BC0EB] bg-[#F8FCFF] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-[#E8F7FF] border border-[#D7EEF9] text-[#0284c7] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <div className="text-sm font-bold text-[#1F2937] mb-1">
                {selectedFileName ? selectedFileName : 'Nhấn để chọn tệp .CSV từ máy tính'}
              </div>
              <p className="text-xs text-[#64748B] max-w-sm">
                Định dạng: Nghĩa tiếng Việt, Từ tiếng Nhật, Hiragana, Katakana, Romaji
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-1.5">
                Dán nội dung CSV (ngăn cách bằng dấu phẩy, tab hoặc chấm phẩy)
              </label>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Hôm nay,今日,きょう,キョウ,kyou&#10;Ngày mai,明日,あした,アシタ,ashita&#10;Xe đạp,自転車,じてんしゃ,ジテンシャ,jitensha"
                rows={7}
                className="w-full bg-[#F8FCFF] border border-[#D7EEF9] rounded-xl p-3 text-xs font-mono text-[#1F2937] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] focus:ring-2 focus:ring-[#5BC0EB]/20 resize-none"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#D7EEF9]">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl border border-[#D7EEF9] bg-[#F8FCFF] hover:bg-[#E8F7FF] text-[#0284c7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Tải tệp CSV mẫu</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-[#D7EEF9] text-[#64748B] hover:text-[#1F2937] hover:bg-[#F0F9FF] text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleProcessImport}
              className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Xác nhận nhập CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

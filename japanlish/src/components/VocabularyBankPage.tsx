import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Upload,
  Download,
  Play,
  Volume2,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Filter,
  ArrowUpDown,
  History,
} from 'lucide-react';
import {
  VocabularyItem,
  CsvImportResult,
  QuizOptions,
  VocabularySortOption,
  VocabularyStatus,
} from '../types/vocabulary';
import { exportVocabularyToCsv } from '../utils/csvParser';
import { soundManager } from '../utils/sound';
import {
  getVocabularyStatus,
  getStatusBadgeConfig,
  sortVocabularyItems,
} from '../utils/learningStats';
import { EditVocabularyModal } from './EditVocabularyModal';
import { ImportCsvModal } from './ImportCsvModal';
import { ImportResultModal } from './ImportResultModal';
import { StartLearningModal } from './StartLearningModal';

interface VocabularyBankPageProps {
  vocabularyBank: VocabularyItem[];
  onUpdateBank: (newBank: VocabularyItem[]) => void;
  onClearBank: () => void;
  onStartLearning: (options: QuizOptions) => void;
  onStartReviewNeedsReview: () => void;
  onStartReviewRecentIncorrect: () => void;
  onOpenGuide: () => void;
}

export const VocabularyBankPage: React.FC<VocabularyBankPageProps> = ({
  vocabularyBank,
  onUpdateBank,
  onClearBank,
  onStartLearning,
  onStartReviewNeedsReview,
  onStartReviewRecentIncorrect,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | VocabularyStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<VocabularySortOption>('newest');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [isImportResultModalOpen, setIsImportResultModalOpen] = useState(false);

  const [isStartLearningModalOpen, setIsStartLearningModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    vocabularyBank.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [vocabularyBank]);

  // Counts by status
  const statusCounts = useMemo(() => {
    let good = 0;
    let learning = 0;
    let needsReview = 0;
    let unlearned = 0;

    vocabularyBank.forEach((item) => {
      const s = getVocabularyStatus(item);
      if (s === 'good') good++;
      else if (s === 'learning') learning++;
      else if (s === 'needs_review') needsReview++;
      else unlearned++;
    });

    return { good, learning, needsReview, unlearned };
  }, [vocabularyBank]);

  // Count items with mistakes recently
  const recentMistakesCount = useMemo(() => {
    return vocabularyBank.filter((item) => (item.incorrectCount || 0) > 0).length;
  }, [vocabularyBank]);

  // Filtered and sorted vocabulary list
  const processedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. Filter
    const filtered = vocabularyBank.filter((item) => {
      // Search Query matches Vietnamese, Japanese, Hiragana, Katakana, or Romaji
      if (q) {
        const matchVi = (item.vietnamese || '').toLowerCase().includes(q);
        const matchJp = (item.japanese || '').toLowerCase().includes(q);
        const matchHi = (item.hiragana || '').toLowerCase().includes(q);
        const matchKa = (item.katakana || '').toLowerCase().includes(q);
        const matchRo = (item.romaji || '').toLowerCase().includes(q);
        if (!matchVi && !matchJp && !matchHi && !matchKa && !matchRo) {
          return false;
        }
      }

      // Status Tab filter
      if (activeStatusTab !== 'all') {
        const status = getVocabularyStatus(item);
        if (status !== activeStatusTab) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      return true;
    });

    // 2. Sort
    return sortVocabularyItems(filtered, sortBy);
  }, [vocabularyBank, searchQuery, activeStatusTab, selectedCategory, sortBy]);

  // Handle Save (Add or Update)
  const handleSaveItem = (itemToSave: VocabularyItem) => {
    const exists = vocabularyBank.some((item) => item.id === itemToSave.id);
    if (exists) {
      const updated = vocabularyBank.map((item) => (item.id === itemToSave.id ? itemToSave : item));
      onUpdateBank(updated);
    } else {
      onUpdateBank([itemToSave, ...vocabularyBank]);
    }
    setEditingItem(null);
  };

  // Handle Delete Single Item
  const handleDeleteItem = (id: string | number) => {
    const updated = vocabularyBank.filter((item) => item.id !== id);
    onUpdateBank(updated);
    setDeletingId(null);
  };

  // Handle Import Completed: Replaces vocabulary pool with new CSV items
  const handleImportCompleted = (result: CsvImportResult) => {
    if (result.successCount > 0) {
      onUpdateBank(result.importedItems);
    }
    setImportResult(result);
    setIsImportResultModalOpen(true);
  };

  // Handle Export CSV
  const handleExportCsv = () => {
    if (vocabularyBank.length === 0) return;
    const csvString = exportVocabularyToCsv(vocabularyBank);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `japanlish_vocabulary_bank_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSpeak = (text: string) => {
    soundManager.speakJapanese(text);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 text-[#1F2937] animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#D7EEF9]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#0284c7] bg-[#E8F7FF] border border-[#D7EEF9] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Nguồn câu hỏi chính
            </span>
            {statusCounts.needsReview > 0 && (
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={11} />
                {statusCounts.needsReview} từ cần ôn
              </span>
            )}
            {statusCounts.good > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                🟢 {statusCounts.good} từ đã vững
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F2937] tracking-tight mt-1 flex items-center gap-2">
            <span>Kho từ vựng</span>
            <span className="text-[#64748B] text-lg font-normal">({vocabularyBank.length} từ)</span>
          </h1>
          <p className="text-[#64748B] text-xs sm:text-sm mt-0.5">
            Quản lý từ vựng, theo dõi tiến độ học tập, tỷ lệ chính xác và luyện tập chuyên sâu theo trạng thái.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* ÔN TỪ CẦN ÔN Button */}
          <button
            type="button"
            onClick={onStartReviewNeedsReview}
            title="Luyện tập các từ có tỷ lệ chính xác thấp hoặc cần duyệt"
            className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <AlertTriangle size={13} className="text-rose-500" />
            <span>ÔN TỪ CẦN ÔN</span>
            {statusCounts.needsReview > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 text-rose-800 font-mono">
                {statusCounts.needsReview}
              </span>
            )}
          </button>

          {/* ÔN TỪ SAI GẦN ĐÂY Button */}
          <button
            type="button"
            onClick={onStartReviewRecentIncorrect}
            title="Luyện tập các từ từng làm sai gần đây nhất"
            className="py-2.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <History size={13} className="text-amber-600" />
            <span>ÔN TỪ SAI GẦN ĐÂY</span>
            {recentMistakesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-mono">
                {recentMistakesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#E8F7FF] border border-[#D7EEF9] text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
          >
            <Upload size={13} className="text-[#0284c7]" />
            <span>Nhập CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsEditModalOpen(true);
            }}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#E8F7FF] border border-[#D7EEF9] text-[#0284c7] text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
          >
            <Plus size={13} className="text-[#0284c7]" />
            <span>Thêm từ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStartLearningModalOpen(true)}
            className="py-2.5 px-4.5 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Play size={13} fill="currentColor" />
            <span>BẮT ĐẦU HỌC</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs & Sorting */}
      <div className="py-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiếng Việt, Kanji, Hiragana, Romaji (shashin, 写真, ảnh)..."
              className="w-full bg-white border border-[#D7EEF9] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1F2937] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] focus:ring-2 focus:ring-[#5BC0EB]/20 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sorting Dropdown & Secondary Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] bg-white border border-[#D7EEF9] rounded-xl px-2.5 py-1.5 shadow-xs">
              <ArrowUpDown size={13} className="text-[#0284c7]" />
              <span className="hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as VocabularySortOption)}
                className="bg-transparent text-[#1F2937] text-xs outline-none cursor-pointer font-medium"
              >
                <option value="newest">Mới nhất</option>
                <option value="most_practiced">Luyện nhiều nhất</option>
                <option value="lowest_accuracy">Tỷ lệ đúng thấp nhất</option>
                <option value="highest_accuracy">Tỷ lệ đúng cao nhất</option>
              </select>
            </div>

            {/* Export CSV, Default, Clear */}
            {vocabularyBank.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                title="Tải xuống toàn bộ từ vựng dạng tệp CSV"
                className="py-2 px-2.5 rounded-xl bg-white border border-[#D7EEF9] text-slate-600 hover:text-[#0284c7] hover:bg-[#E8F7FF] text-xs font-medium flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Xuất CSV</span>
              </button>
            )}

            {vocabularyBank.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                title="Xóa toàn bộ kho từ vựng"
                className="py-2 px-2.5 rounded-xl bg-white border border-[#D7EEF9] text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Xóa kho</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#D7EEF9]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveStatusTab('all')}
              className={`py-1 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeStatusTab === 'all'
                  ? 'bg-[#E8F7FF] text-[#0284c7] border border-[#5BC0EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-[#D7EEF9]'
              }`}
            >
              Tất cả ({vocabularyBank.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusTab('good')}
              className={`py-1 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeStatusTab === 'good'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-[#D7EEF9]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Đã vững</span>
              <span className="text-[10px] text-emerald-700 font-mono font-semibold">({statusCounts.good})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusTab('learning')}
              className={`py-1 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeStatusTab === 'learning'
                  ? 'bg-amber-50 text-amber-900 border border-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-[#D7EEF9]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Đang học</span>
              <span className="text-[10px] text-amber-800 font-mono font-semibold">({statusCounts.learning})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusTab('needs_review')}
              className={`py-1 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeStatusTab === 'needs_review'
                  ? 'bg-rose-50 text-rose-800 border border-rose-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-[#D7EEF9]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Cần ôn</span>
              <span className="text-[10px] text-rose-700 font-mono font-semibold">({statusCounts.needsReview})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusTab('unlearned')}
              className={`py-1 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeStatusTab === 'unlearned'
                  ? 'bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-[#D7EEF9]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              <span>Chưa học</span>
              <span className="text-[10px] text-slate-600 font-mono font-semibold">({statusCounts.unlearned})</span>
            </button>
          </div>

          {/* Category Dropdown */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Filter size={12} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-[#D7EEF9] rounded-lg px-2.5 py-1 text-xs text-[#1F2937] outline-none focus:border-[#5BC0EB] shadow-xs"
              >
                <option value="all">Mọi chủ đề</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Vocabulary List Cards */}
      {vocabularyBank.length === 0 ? (
        <div className="bg-white border border-[#D7EEF9] rounded-2xl p-12 text-center my-6 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Upload size={22} />
          </div>
          <h3 className="text-base font-bold text-[#1F2937]">Vui lòng nhập file CSV để bắt đầu luyện tập.</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Ứng dụng chỉ sử dụng các từ vựng có trong file CSV của bạn. Chưa có từ vựng nào được nạp vào kho.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Nhập file CSV ngay
            </button>
          </div>
        </div>
      ) : processedItems.length === 0 ? (
        <div className="bg-white border border-[#D7EEF9] rounded-2xl p-12 text-center my-6 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#E8F7FF] text-[#0284c7] flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <h3 className="text-base font-bold text-[#1F2937]">Không tìm thấy từ vựng nào</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            {searchQuery
              ? `Không có kết quả phù hợp với từ khóa "${searchQuery}". Thử tìm theo nghĩa tiếng Việt, Kanji hoặc Romaji.`
              : 'Không có từ nào phù hợp với bộ lọc hiện tại.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Xóa tìm kiếm
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-[#E8F7FF] border border-[#D7EEF9] text-[#0284c7] text-xs font-semibold cursor-pointer"
            >
              Nhập file CSV khác
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-12">
          {processedItems.map((item) => {
            const status = getVocabularyStatus(item);
            const statusConfig = getStatusBadgeConfig(status);
            const accuracy = item.accuracy ?? 0;
            const practiced = item.timesPracticed || 0;

            return (
              <div
                key={String(item.id)}
                className={`bg-white border border-[#D7EEF9] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-150 shadow-xs hover:border-sky-300 ${statusConfig.cardBorder}`}
              >
                <div>
                  {/* Top Row: Category, Level and Status Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#D7EEF9] mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${statusConfig.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                        <span>{statusConfig.label}</span>
                        {practiced > 0 && <span className="font-mono">({accuracy}%)</span>}
                      </span>

                      {item.jlptLevel && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8F7FF] text-[#0284c7] border border-[#D7EEF9]">
                          {item.jlptLevel}
                        </span>
                      )}

                      {item.category && (
                        <span className="text-[11px] text-[#64748B] font-medium">
                          #{item.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSpeak(item.japanese || item.hiragana)}
                        title="Nghe phát âm tiếng Nhật"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284c7] hover:bg-[#E8F7FF] transition-colors cursor-pointer"
                      >
                        <Volume2 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditModalOpen(true);
                        }}
                        title="Chỉnh sửa từ vựng"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284c7] hover:bg-[#E8F7FF] transition-colors cursor-pointer"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingId(item.id)}
                        title="Xóa từ khỏi kho"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Japanese Word & Vietnamese Meaning */}
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-japanese tracking-wide">
                        {item.japanese}
                      </h3>
                      <p className="text-sm sm:text-base font-bold text-[#0284c7] mt-1">
                        {item.vietnamese}
                      </p>
                    </div>

                    {/* Practice stats: count, accuracy, correct/incorrect */}
                    {practiced > 0 ? (
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-[#64748B] block font-medium">
                          Đã luyện: <strong className="text-[#1F2937]">{practiced}</strong> lần
                        </span>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          <span className="text-emerald-700 font-bold">{item.correctCount || 0} đúng</span>
                          <span className="text-slate-300 mx-1">•</span>
                          <span className="text-rose-600 font-bold">{item.incorrectCount || 0} sai</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        Chưa luyện
                      </span>
                    )}
                  </div>

                  {/* Readings breakdown: Hiragana, Katakana, Romaji */}
                  <div className="mt-3 pt-2.5 border-t border-[#D7EEF9] grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                        Hiragana
                      </span>
                      <span className="font-japanese text-[#1F2937] font-medium">
                        {item.hiragana || (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsEditModalOpen(true);
                            }}
                            className="text-[#0284c7] hover:underline"
                          >
                            + Nhập đọc
                          </button>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                        Katakana
                      </span>
                      <span className="font-japanese text-slate-700 font-medium">
                        {item.katakana || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                        Romaji
                      </span>
                      <span className="font-mono text-[#64748B] text-[11px]">
                        {item.romaji || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Example sentence if present */}
                  {item.exampleVi && (
                    <div className="mt-2.5 pt-2 border-t border-[#D7EEF9] text-xs text-[#64748B]">
                      <span>Ví dụ: {item.exampleVi}</span>
                      {item.exampleJp && (
                        <span className="font-japanese text-slate-700 ml-2">
                          ({item.exampleJp})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#D7EEF9] rounded-2xl max-w-sm w-full p-6 text-[#1F2937] shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937] mb-1.5">Xóa từ vựng này?</h3>
            <p className="text-xs text-[#64748B] mb-6">
              Từ này sẽ bị xóa khỏi kho lưu trữ và không còn xuất hiện trong các bài luyện tập.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(deletingId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Bank Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#D7EEF9] rounded-2xl max-w-sm w-full p-6 text-[#1F2937] shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937] mb-1.5">Xóa toàn bộ kho từ vựng?</h3>
            <p className="text-xs text-[#64748B] mb-6">
              Thao tác này sẽ xóa tất cả {vocabularyBank.length} từ hiện có trong kho. Bạn có thể nhập lại từ file CSV hoặc khôi phục mặc định bất kỳ lúc nào.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmClearOpen(false);
                  onClearBank();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Xóa sạch kho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Default Confirmation Modal */}
      {/* Edit / Add Modal */}
      {isEditModalOpen && (
        <EditVocabularyModal
          item={editingItem}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
        />
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <ImportCsvModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportCompleted={handleImportCompleted}
        />
      )}

      {/* CSV Import Summary Result Modal */}
      {isImportResultModalOpen && importResult && (
        <ImportResultModal
          result={importResult}
          isOpen={isImportResultModalOpen}
          onClose={() => {
            setIsImportResultModalOpen(false);
            setImportResult(null);
          }}
          onStartLearning={() => {
            setIsImportResultModalOpen(false);
            setIsStartLearningModalOpen(true);
          }}
        />
      )}

      {/* Start Learning Configuration Modal */}
      {isStartLearningModalOpen && (
        <StartLearningModal
          isOpen={isStartLearningModalOpen}
          totalWords={vocabularyBank.length}
          availableCategories={categories}
          onClose={() => setIsStartLearningModalOpen(false)}
          onConfirmStart={(options) => {
            setIsStartLearningModalOpen(false);
            onStartLearning(options);
          }}
        />
      )}
    </div>
  );
};

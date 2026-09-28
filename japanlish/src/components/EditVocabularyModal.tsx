import React, { useState, useEffect } from 'react';
import { X, Volume2, Sparkles, Check, AlertCircle } from 'lucide-react';
import * as wanakana from 'wanakana';
import { VocabularyItem } from '../types/vocabulary';
import { autoResolveJapaneseReadings } from '../utils/kanjiDictionary';
import { soundManager } from '../utils/sound';

interface EditVocabularyModalProps {
  isOpen: boolean;
  item: VocabularyItem | null;
  onClose: () => void;
  onSave: (updatedItem: VocabularyItem) => void;
}

export const EditVocabularyModal: React.FC<EditVocabularyModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const isNew = !item?.id;

  const [vietnamese, setVietnamese] = useState('');
  const [japanese, setJapanese] = useState('');
  const [hiragana, setHiragana] = useState('');
  const [katakana, setKatakana] = useState('');
  const [romaji, setRomaji] = useState('');
  const [category, setCategory] = useState('');
  const [jlptLevel, setJlptLevel] = useState('N5');
  const [exampleVi, setExampleVi] = useState('');
  const [exampleJp, setExampleJp] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setVietnamese(item.vietnamese || '');
      setJapanese(item.japanese || '');
      setHiragana(item.hiragana || '');
      setKatakana(item.katakana || '');
      setRomaji(item.romaji || '');
      setCategory(item.category || '');
      setJlptLevel(item.jlptLevel || 'N5');
      setExampleVi(item.exampleVi || '');
      setExampleJp(item.exampleJp || '');
      setError(null);
    } else {
      setVietnamese('');
      setJapanese('');
      setHiragana('');
      setKatakana('');
      setRomaji('');
      setCategory('');
      setJlptLevel('N5');
      setExampleVi('');
      setExampleJp('');
      setError(null);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  // Auto resolve when user types Japanese if fields are empty
  const handleJapaneseBlur = () => {
    if (!japanese.trim()) return;
    if (!hiragana.trim()) {
      const resolved = autoResolveJapaneseReadings(japanese);
      if (resolved.hiragana) {
        setHiragana(resolved.hiragana);
        setKatakana(resolved.katakana);
        setRomaji(resolved.romaji);
      }
    }
  };

  // When Hiragana changes, automatically synchronize Katakana & Romaji
  const handleHiraganaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const kanaVal = wanakana.toHiragana(val);
    setHiragana(kanaVal);
    if (kanaVal.trim()) {
      setKatakana(wanakana.toKatakana(kanaVal));
      setRomaji(wanakana.toRomaji(kanaVal));
    }
  };

  const handleManualAutoFill = () => {
    if (!japanese.trim()) return;
    const resolved = autoResolveJapaneseReadings(japanese);
    if (resolved.hiragana) {
      setHiragana(resolved.hiragana);
      setKatakana(resolved.katakana);
      setRomaji(resolved.romaji);
      setError(null);
    } else {
      setError('Chưa tìm thấy cách đọc tự động cho chữ Kanji này. Vui lòng nhập Hiragana thủ công.');
    }
  };

  const handleSpeak = () => {
    soundManager.speakJapanese(japanese || hiragana);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vietnamese.trim() || !japanese.trim()) {
      setError('Vui lòng nhập đầy đủ nghĩa tiếng Việt và từ tiếng Nhật.');
      return;
    }

    let cleanHiragana = hiragana.trim();
    let cleanKatakana = katakana.trim();
    let cleanRomaji = romaji.trim().toLowerCase();

    // If Hiragana missing, attempt auto resolve
    if (!cleanHiragana) {
      const resolved = autoResolveJapaneseReadings(japanese);
      cleanHiragana = resolved.hiragana;
      cleanKatakana = resolved.katakana;
      cleanRomaji = resolved.romaji;
    }

    const needsReview = !cleanHiragana;

    const savedItem: VocabularyItem = {
      id: item?.id || `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      vietnamese: vietnamese.trim(),
      japanese: japanese.trim(),
      hiragana: cleanHiragana,
      katakana: cleanKatakana,
      romaji: cleanRomaji,
      category: category.trim() || undefined,
      jlptLevel: jlptLevel || 'N5',
      exampleVi: exampleVi.trim() || undefined,
      exampleJp: exampleJp.trim() || undefined,
      needsReview,
      timesPracticed: item?.timesPracticed || 0,
      correctCount: item?.correctCount || 0,
      incorrectCount: item?.incorrectCount || 0,
      lastPracticed: item?.lastPracticed,
      createdAt: item?.createdAt || new Date().toISOString(),
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#D7EEF9] rounded-2xl max-w-lg w-full p-6 text-[#1F2937] shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D7EEF9] mb-5">
          <div>
            <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              {isNew ? 'Thêm từ vựng mới' : 'Chỉnh sửa từ vựng'}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Cập nhật nghĩa, chữ Nhật và cách đọc chuẩn để luyện gõ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#E8F7FF] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vietnamese */}
          <div>
            <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-1.5">
              Nghĩa tiếng Việt <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={vietnamese}
              onChange={(e) => setVietnamese(e.target.value)}
              placeholder="Ví dụ: Ảnh, Trường học, Vay mượn"
              className="w-full bg-white border border-[#D7EEF9] rounded-xl px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] focus:ring-2 focus:ring-[#5BC0EB]/20 shadow-xs"
              required
            />
          </div>

          {/* Japanese */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                Từ tiếng Nhật (Kanji / Kana) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {japanese.trim() && (
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="text-xs text-slate-500 hover:text-[#0284c7] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Volume2 size={13} />
                    <span>Nghe</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleManualAutoFill}
                  className="text-xs text-[#0284c7] hover:text-sky-700 flex items-center gap-1 transition-colors hover:underline cursor-pointer font-medium"
                >
                  <Sparkles size={12} />
                  <span>Tự động nhận diện</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={japanese}
              onChange={(e) => setJapanese(e.target.value)}
              onBlur={handleJapaneseBlur}
              placeholder="Ví dụ: 写真, 学校, 友達, コーヒー"
              className="w-full bg-white border border-[#D7EEF9] rounded-xl px-4 py-2.5 text-lg font-bold font-japanese text-[#1F2937] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] focus:ring-2 focus:ring-[#5BC0EB]/20 shadow-xs"
              required
            />
          </div>

          {/* Readings Grid: Hiragana, Katakana, Romaji */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Hiragana */}
            <div>
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-1">
                Hiragana
              </label>
              <input
                type="text"
                value={hiragana}
                onChange={handleHiraganaChange}
                placeholder="しゃしん"
                className="w-full bg-white border border-[#D7EEF9] rounded-xl px-3 py-2 text-sm font-japanese text-[#0284c7] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] shadow-xs"
              />
              <span className="text-[10px] text-[#64748B] mt-0.5 block">Tự tạo Katakana & Romaji</span>
            </div>

            {/* Katakana */}
            <div>
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-1">
                Katakana
              </label>
              <input
                type="text"
                value={katakana}
                onChange={(e) => setKatakana(wanakana.toKatakana(e.target.value))}
                placeholder="シャシン"
                className="w-full bg-white border border-[#D7EEF9] rounded-xl px-3 py-2 text-sm font-japanese text-[#0284c7] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] shadow-xs"
              />
            </div>

            {/* Romaji */}
            <div>
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-1">
                Romaji
              </label>
              <input
                type="text"
                value={romaji}
                onChange={(e) => setRomaji(e.target.value.toLowerCase())}
                placeholder="shashin"
                className="w-full bg-white border border-[#D7EEF9] rounded-xl px-3 py-2 text-sm font-mono text-[#1F2937] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] shadow-xs"
              />
            </div>
          </div>

          {/* Level & Category */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-1.5">
                Trình độ JLPT
              </label>
              <select
                value={jlptLevel}
                onChange={(e) => setJlptLevel(e.target.value)}
                className="w-full bg-white border border-[#D7EEF9] rounded-xl px-3 py-2 text-xs text-[#1F2937] outline-none focus:border-[#5BC0EB] shadow-xs"
              >
                <option value="N5">JLPT N5 (Cơ bản)</option>
                <option value="N4">JLPT N4 (Sơ cấp)</option>
                <option value="N3">JLPT N3 (Trung cấp)</option>
                <option value="N2">JLPT N2</option>
                <option value="N1">JLPT N1</option>
                <option value="Khác">Khác / Từ vựng tự do</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block mb-1.5">
                Chủ đề / Phân loại
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Động từ, Đồ vật, v.v."
                className="w-full bg-white border border-[#D7EEF9] rounded-xl px-3 py-2 text-xs text-[#1F2937] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] shadow-xs"
              />
            </div>
          </div>

          {/* Example Sentence (Optional) */}
          <div className="pt-1 space-y-2">
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              Câu ví dụ minh họa (Tùy chọn)
            </label>
            <input
              type="text"
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
              placeholder="Nghĩa ví dụ: Chụp một bức ảnh đẹp."
              className="w-full bg-white border border-[#D7EEF9] rounded-xl px-3 py-2 text-xs text-[#1F2937] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] shadow-xs"
            />
            <input
              type="text"
              value={exampleJp}
              onChange={(e) => setExampleJp(e.target.value)}
              placeholder="Câu tiếng Nhật: きれいな写真を撮る。"
              className="w-full bg-white border border-[#D7EEF9] rounded-xl px-3 py-2 text-xs text-[#1F2937] placeholder:text-slate-400 outline-none focus:border-[#5BC0EB] shadow-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D7EEF9] mt-6">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white text-xs font-bold transition-all shadow-xs active:scale-[0.99] flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>{isNew ? 'Lưu từ mới' : 'Cập nhật'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

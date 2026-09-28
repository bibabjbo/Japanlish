import * as wanakana from 'wanakana';
import { VocabularyItem, CsvImportResult } from '../types/vocabulary';
import { autoResolveJapaneseReadings } from './kanjiDictionary';
import { convertKanaMode } from './kanaConverter';

/**
 * Splits a CSV line into columns, respecting quoted strings.
 */
function parseCsvLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Detects the delimiter (comma, semicolon, or tab).
 */
function detectDelimiter(firstLine: string): string {
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';') && !firstLine.includes(',')) return ';';
  return ',';
}

interface ColumnMapping {
  vietnamese: number;
  japanese: number;
  hiragana: number;
  katakana: number;
  romaji: number;
  category: number;
  jlptLevel: number;
}

/**
 * Detects header column indices based on common Vietnamese and English keywords.
 */
function detectColumnMapping(headers: string[]): { isHeader: boolean; mapping: ColumnMapping } {
  const mapping: ColumnMapping = {
    vietnamese: -1,
    japanese: -1,
    hiragana: -1,
    katakana: -1,
    romaji: -1,
    category: -1,
    jlptLevel: -1,
  };

  let matches = 0;

  headers.forEach((h, idx) => {
    const header = h.toLowerCase().trim();

    // Check Vietnamese / Meaning column
    if (
      header.includes('nghĩa') ||
      header.includes('nghia') ||
      header.includes('tiếng việt') ||
      header.includes('tieng viet') ||
      header.includes('vietnamese') ||
      header.includes('meaning')
    ) {
      if (mapping.vietnamese === -1) {
        mapping.vietnamese = idx;
        matches++;
        return;
      }
    }

    // Check Japanese / Kanji / Word column
    if (
      (header.includes('từ tiếng nhật') ||
        header.includes('tu tieng nhat') ||
        header.includes('tiếng nhật') ||
        header.includes('tieng nhat') ||
        header.includes('japanese') ||
        header.includes('kanji') ||
        header === 'từ' ||
        header === 'tu' ||
        header === 'word') &&
      !header.includes('nghĩa')
    ) {
      if (mapping.japanese === -1) {
        mapping.japanese = idx;
        matches++;
        return;
      }
    }

    // Check Hiragana column
    if (
      header.includes('hiragana') ||
      header.includes('cách đọc') ||
      header.includes('cach doc') ||
      header === 'kana' ||
      header === 'reading'
    ) {
      if (mapping.hiragana === -1) {
        mapping.hiragana = idx;
        matches++;
        return;
      }
    }

    // Check Katakana column
    if (header.includes('katakana')) {
      if (mapping.katakana === -1) {
        mapping.katakana = idx;
        matches++;
        return;
      }
    }

    // Check Romaji column
    if (header.includes('romaji') || header.includes('latin')) {
      if (mapping.romaji === -1) {
        mapping.romaji = idx;
        matches++;
        return;
      }
    }

    // Check Category column
    if (
      header.includes('chủ đề') ||
      header.includes('chu de') ||
      header.includes('danh mục') ||
      header.includes('danh muc') ||
      header.includes('category') ||
      header.includes('topic')
    ) {
      if (mapping.category === -1) {
        mapping.category = idx;
        matches++;
        return;
      }
    }

    // Check JLPT level column
    if (
      header.includes('jlpt') ||
      header.includes('cấp độ') ||
      header.includes('cap do') ||
      header.includes('level')
    ) {
      if (mapping.jlptLevel === -1) {
        mapping.jlptLevel = idx;
        matches++;
        return;
      }
    }
  });

  const isHeader = matches >= 1 || mapping.vietnamese !== -1 || mapping.japanese !== -1;

  // Fallback defaults if header is not detected or certain columns not found
  if (!isHeader) {
    return {
      isHeader: false,
      mapping: {
        vietnamese: 0,
        japanese: 1,
        hiragana: 2,
        katakana: 3,
        romaji: 4,
        category: 5,
        jlptLevel: 6,
      },
    };
  }

  // If header was detected but some standard columns were missing, assign positional defaults
  if (mapping.vietnamese === -1) mapping.vietnamese = 0;
  if (mapping.japanese === -1) mapping.japanese = 1;
  if (mapping.hiragana === -1 && headers.length > 2) mapping.hiragana = 2;
  if (mapping.katakana === -1 && headers.length > 3) mapping.katakana = 3;
  if (mapping.romaji === -1 && headers.length > 4) mapping.romaji = 4;

  return { isHeader: true, mapping };
}

/**
 * Parses and validates CSV content into VocabularyItems.
 * STRICT: Creates a vocabulary pool ONLY from valid rows in this CSV.
 * Does NOT mix with any old CSV vocabulary.
 */
export function parseAndValidateCsv(csvContent: string): CsvImportResult {
  const lines = csvContent.split(/\r?\n/);
  const importedItems: VocabularyItem[] = [];
  const skippedDetails: CsvImportResult['skippedDetails'] = [];
  const batchSet = new Set<string>();

  if (lines.length === 0) {
    return {
      totalRows: 0,
      successCount: 0,
      skippedCount: 0,
      importedItems: [],
      skippedDetails: [],
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const firstRowCols = parseCsvLine(lines[0], delimiter);
  const { isHeader, mapping } = detectColumnMapping(firstRowCols);

  let effectiveLines = lines;
  let lineOffset = 1;

  if (isHeader) {
    effectiveLines = lines.slice(1);
    lineOffset = 2;
  }

  const totalRows = effectiveLines.filter(l => l.trim().length > 0).length;

  effectiveLines.forEach((rawLine, idx) => {
    const rowNum = idx + lineOffset;
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      return; // Skip empty rows
    }

    const cols = parseCsvLine(trimmedLine, delimiter);

    const vietnamese = (cols[mapping.vietnamese] || '').trim();
    const japanese = (cols[mapping.japanese] || '').trim();
    let hiragana = (mapping.hiragana !== -1 ? cols[mapping.hiragana] || '' : '').trim();
    let katakana = (mapping.katakana !== -1 ? cols[mapping.katakana] || '' : '').trim();
    let romaji = (mapping.romaji !== -1 ? cols[mapping.romaji] || '' : '').trim();
    const category = (mapping.category !== -1 ? cols[mapping.category] || '' : '').trim();
    const jlptLevel = (mapping.jlptLevel !== -1 ? cols[mapping.jlptLevel] || '' : '').trim();

    // Validation 1: Missing Vietnamese meaning
    if (!vietnamese) {
      skippedDetails.push({
        rowNumber: rowNum,
        rawContent: trimmedLine,
        reason: 'Thiếu cột nghĩa tiếng Việt',
      });
      return;
    }

    // Validation 2: Missing Japanese word
    if (!japanese) {
      skippedDetails.push({
        rowNumber: rowNum,
        rawContent: trimmedLine,
        reason: 'Thiếu cột từ tiếng Nhật',
      });
      return;
    }

    // Resolve Hiragana reading if not explicitly provided
    if (!hiragana) {
      if (wanakana.isHiragana(japanese)) {
        hiragana = japanese;
      } else if (wanakana.isKatakana(japanese)) {
        hiragana = wanakana.toHiragana(japanese);
      } else {
        const resolved = autoResolveJapaneseReadings(japanese, '');
        hiragana = resolved.hiragana || japanese;
      }
    }

    // Resolve Katakana if not explicitly provided
    if (!katakana) {
      if (wanakana.isKatakana(japanese)) {
        katakana = japanese;
      } else {
        katakana = convertKanaMode(hiragana, 'katakana');
      }
    }

    // Resolve Romaji if not explicitly provided
    if (!romaji) {
      romaji = wanakana.toRomaji(hiragana);
    }

    // Build alternative accepted answers
    const altAnswers: string[] = [hiragana];
    if (katakana && katakana !== hiragana) altAnswers.push(katakana);
    if (japanese && japanese !== hiragana && japanese !== katakana) altAnswers.push(japanese);

    const normalizedKey = `${vietnamese.toLowerCase()}__${japanese.toLowerCase()}`;
    if (batchSet.has(normalizedKey)) {
      skippedDetails.push({
        rowNumber: rowNum,
        rawContent: trimmedLine,
        reason: `Dòng trùng lặp với từ "${japanese}" trong cùng file CSV`,
      });
      return;
    }
    batchSet.add(normalizedKey);

    const newItem: VocabularyItem = {
      id: `csv_${Date.now()}_${idx + 1}`,
      vietnamese,
      japanese,
      hiragana,
      katakana,
      romaji,
      category: category || 'CSV Import',
      jlptLevel: jlptLevel || 'N5',
      altAnswers,
      timesPracticed: 0,
      correctCount: 0,
      incorrectCount: 0,
      accuracy: 0,
      createdAt: new Date().toISOString(),
    };

    importedItems.push(newItem);
  });

  return {
    totalRows,
    successCount: importedItems.length,
    skippedCount: skippedDetails.length,
    importedItems,
    skippedDetails,
  };
}

/**
 * Generates CSV string from VocabularyItem array for downloading.
 */
export function exportVocabularyToCsv(items: VocabularyItem[]): string {
  const headers = ['Nghĩa tiếng Việt', 'Từ tiếng Nhật', 'Hiragana', 'Katakana', 'Romaji', 'Chủ đề'];
  const rows = items.map(item => [
    `"${(item.vietnamese || '').replace(/"/g, '""')}"`,
    `"${(item.japanese || '').replace(/"/g, '""')}"`,
    `"${(item.hiragana || '').replace(/"/g, '""')}"`,
    `"${(item.katakana || '').replace(/"/g, '""')}"`,
    `"${(item.romaji || '').replace(/"/g, '""')}"`,
    `"${(item.category || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

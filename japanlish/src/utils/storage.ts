import { VocabularyItem } from '../types/vocabulary';
import { calculateAccuracy } from './learningStats';

const CSV_STORAGE_KEY = 'japanlish_csv_vocabulary_pool';
const LEGACY_STORAGE_KEY = 'japanlish_vocabulary_bank_v2';
const OLD_LEGACY_KEY = 'kotoba_vocabulary_bank_v2';

/**
 * Initializes and loads the Vocabulary Bank from localStorage.
 * STRICT RULE: Only returns vocabulary loaded from user-imported CSV files.
 * Returns empty array [] if no CSV has been imported. Does NOT seed any default vocabulary.
 */
export function loadVocabularyBank(): VocabularyItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(CSV_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out any legacy default seeded items (id starting with 'default_')
        const csvItems = parsed.filter(item => !String(item.id || '').startsWith('default_'));
        if (csvItems.length > 0) {
          return csvItems.map((item: VocabularyItem) => ({
            ...item,
            accuracy:
              item.accuracy !== undefined
                ? item.accuracy
                : calculateAccuracy(item.correctCount || 0, item.timesPracticed || 0),
          }));
        }
      }
    }

    // No valid imported CSV found - strictly return empty array
    return [];
  } catch (err) {
    console.error('Failed to load vocabulary bank from localStorage:', err);
    return [];
  }
}

/**
 * Saves the vocabulary bank items to localStorage.
 */
export function saveVocabularyBank(items: VocabularyItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(items));
    // Clear out any old legacy keys to prevent data contamination
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(OLD_LEGACY_KEY);
  } catch (err) {
    console.error('Failed to save vocabulary bank to localStorage:', err);
  }
}

/**
 * Updates a single vocabulary item's statistics immediately after an answer is submitted.
 * Called on EVERY submitted answer:
 * - timesPracticed += 1
 * - correctCount += 1 (if correct) or incorrectCount += 1 (if incorrect)
 * - lastPracticed = ISO timestamp
 * - accuracy = (correctCount / timesPracticed) * 100
 */
export function updateSingleAnswerStats(
  itemIdentifier: string | number,
  isCorrect: boolean
): VocabularyItem[] {
  const currentBank = loadVocabularyBank();
  const searchKey = String(itemIdentifier).trim().toLowerCase();

  const updatedBank = currentBank.map((item) => {
    const itemId = String(item.id || '').trim().toLowerCase();
    const itemJp = String(item.japanese || '').trim().toLowerCase();

    if (itemId !== searchKey && itemJp !== searchKey) {
      return item;
    }

    const newTimesPracticed = (item.timesPracticed || 0) + 1;
    const newCorrectCount = (item.correctCount || 0) + (isCorrect ? 1 : 0);
    const newIncorrectCount = (item.incorrectCount || 0) + (isCorrect ? 0 : 1);
    const newAccuracy = calculateAccuracy(newCorrectCount, newTimesPracticed);

    return {
      ...item,
      timesPracticed: newTimesPracticed,
      correctCount: newCorrectCount,
      incorrectCount: newIncorrectCount,
      lastPracticed: new Date().toISOString(),
      accuracy: newAccuracy,
    };
  });

  saveVocabularyBank(updatedBank);
  return updatedBank;
}

/**
 * Clears the vocabulary bank completely.
 */
export function clearVocabularyBank(): VocabularyItem[] {
  saveVocabularyBank([]);
  return [];
}

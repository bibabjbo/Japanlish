export type KanaMode = 'hiragana' | 'katakana';

export type QuizState = 'ANSWERING' | 'CORRECT_FEEDBACK' | 'INCORRECT_FEEDBACK' | 'FINISHED';

export type VocabularyStatus = 'good' | 'learning' | 'needs_review' | 'unlearned';

export type VocabularySortOption = 'newest' | 'most_practiced' | 'lowest_accuracy' | 'highest_accuracy';

export interface VocabularyItem {
  id: number | string;
  vietnamese: string;
  japanese: string;
  hiragana: string;
  katakana: string;
  romaji: string;
  exampleVi?: string;
  exampleJp?: string;
  category?: string;
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Khác' | string;
  image?: string;
  timesPracticed?: number;
  correctCount?: number;
  incorrectCount?: number;
  lastPracticed?: string;
  accuracy?: number; // e.g., 87.5%
  needsReview?: boolean;
  altAnswers?: string[];
  createdAt?: string;
}

export interface QuizQuestion extends VocabularyItem {
  questionIndex: number;
}

export interface QuestionResult {
  question: VocabularyItem;
  userAnswer: string;
  isCorrect: boolean;
  mode: KanaMode;
}

export interface QuizStats {
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  timeSpentSeconds: number;
  results: QuestionResult[];
}

export interface CsvImportResult {
  totalRows: number;
  successCount: number;
  skippedCount: number;
  importedItems: VocabularyItem[];
  skippedDetails: {
    rowNumber: number;
    rawContent: string;
    reason: string;
  }[];
}

export interface QuizOptions {
  questionCount: number;
  initialMode: KanaMode;
  category: string;
  order: 'random' | 'original';
  customItems?: VocabularyItem[];
  title?: string;
}

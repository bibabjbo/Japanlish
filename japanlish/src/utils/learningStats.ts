import { VocabularyItem, VocabularyStatus, VocabularySortOption } from '../types/vocabulary';

/**
 * Calculates accuracy percentage rounded to 1 decimal place (e.g. 87.5).
 */
export function calculateAccuracy(correctCount: number = 0, timesPracticed: number = 0): number {
  if (timesPracticed <= 0) return 0;
  return Math.round((correctCount / timesPracticed) * 1000) / 10;
}

/**
 * Determines the vocabulary learning status based on simple statistics:
 * 🟢 Good (Đã vững): accuracy >= 80% and practiced at least 2 times
 * 🟡 Learning (Đang học): accuracy between 50% and 79% (or accuracy >= 80% but practiced only 1 time)
 * 🔴 Needs Review (Cần ôn): accuracy < 50% or explicitly marked needsReview
 * ⚪ Unlearned (Chưa học): timesPracticed === 0
 */
export function getVocabularyStatus(item: VocabularyItem): VocabularyStatus {
  // If flagged as missing reliable reading
  if (item.needsReview) {
    return 'needs_review';
  }

  const practiced = item.timesPracticed || 0;
  if (practiced === 0) {
    return 'unlearned';
  }

  const accuracy =
    item.accuracy !== undefined
      ? item.accuracy
      : calculateAccuracy(item.correctCount || 0, practiced);

  // Good: accuracy >= 80% and practiced several times (>= 2)
  if (accuracy >= 80 && practiced >= 2) {
    return 'good';
  }

  // Learning: accuracy between 50% and 79%, or 80%+ with only 1 practice
  if (accuracy >= 50) {
    return 'learning';
  }

  // Needs review: accuracy < 50%
  return 'needs_review';
}

/**
 * Visual badge styling and metadata for each status
 */
export function getStatusBadgeConfig(status: VocabularyStatus) {
  switch (status) {
    case 'good':
      return {
        label: 'Đã vững',
        subLabel: '🟢 Đã vững',
        dotClass: 'bg-emerald-500',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        cardBorder: 'hover:border-emerald-300',
      };
    case 'learning':
      return {
        label: 'Đang học',
        subLabel: '🟡 Đang học',
        dotClass: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        cardBorder: 'hover:border-amber-300',
      };
    case 'needs_review':
      return {
        label: 'Cần ôn',
        subLabel: '🔴 Cần ôn',
        dotClass: 'bg-rose-500',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        cardBorder: 'hover:border-rose-300',
      };
    case 'unlearned':
    default:
      return {
        label: 'Chưa học',
        subLabel: '⚪ Chưa học',
        dotClass: 'bg-slate-400',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        cardBorder: 'hover:border-slate-300',
      };
  }
}

/**
 * Sorts vocabulary list according to selected criteria:
 * - newest: by createdAt or id
 * - most_practiced: by timesPracticed desc
 * - lowest_accuracy: practiced words with lowest accuracy first, followed by unlearned
 * - highest_accuracy: practiced words with highest accuracy first
 */
export function sortVocabularyItems(
  items: VocabularyItem[],
  sortBy: VocabularySortOption
): VocabularyItem[] {
  const list = [...items];

  switch (sortBy) {
    case 'most_practiced':
      return list.sort((a, b) => (b.timesPracticed || 0) - (a.timesPracticed || 0));

    case 'lowest_accuracy':
      return list.sort((a, b) => {
        const aPracticed = (a.timesPracticed || 0) > 0;
        const bPracticed = (b.timesPracticed || 0) > 0;
        // Prioritize practiced words with lowest accuracy
        if (aPracticed && bPracticed) {
          const accA = a.accuracy ?? calculateAccuracy(a.correctCount, a.timesPracticed);
          const accB = b.accuracy ?? calculateAccuracy(b.correctCount, b.timesPracticed);
          return accA - accB;
        }
        if (aPracticed) return -1;
        if (bPracticed) return 1;
        return 0;
      });

    case 'highest_accuracy':
      return list.sort((a, b) => {
        const aPracticed = (a.timesPracticed || 0) > 0;
        const bPracticed = (b.timesPracticed || 0) > 0;
        if (aPracticed && bPracticed) {
          const accA = a.accuracy ?? calculateAccuracy(a.correctCount, a.timesPracticed);
          const accB = b.accuracy ?? calculateAccuracy(b.correctCount, b.timesPracticed);
          return accB - accA;
        }
        if (aPracticed) return -1;
        if (bPracticed) return 1;
        return 0;
      });

    case 'newest':
    default:
      return list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }
}

/**
 * Filters words for "ÔN TỪ CẦN ÔN" (Review words with poor accuracy or needing review).
 * Prioritizes lowest accuracy and items marked needsReview.
 */
export function getNeedsReviewItems(bank: VocabularyItem[], limit: number = 20): VocabularyItem[] {
  const needsReviewList = bank.filter((item) => {
    const status = getVocabularyStatus(item);
    return status === 'needs_review' || (item.timesPracticed && item.timesPracticed > 0 && (item.accuracy || 0) < 60);
  });

  // Sort by lowest accuracy first
  needsReviewList.sort((a, b) => {
    const accA = a.accuracy ?? calculateAccuracy(a.correctCount, a.timesPracticed);
    const accB = b.accuracy ?? calculateAccuracy(b.correctCount, b.timesPracticed);
    return accA - accB;
  });

  if (needsReviewList.length > 0) {
    return needsReviewList.slice(0, limit);
  }

  // Fallback: If no words have low accuracy, pick unlearned words
  const unlearned = bank.filter((item) => (item.timesPracticed || 0) === 0);
  return unlearned.slice(0, limit);
}

/**
 * Filters words for "ÔN TỪ SAI GẦN ĐÂY" (Prioritizes words answered incorrectly recently).
 */
export function getRecentIncorrectItems(bank: VocabularyItem[], limit: number = 20): VocabularyItem[] {
  const recentMistakes = bank.filter((item) => (item.incorrectCount || 0) > 0);

  // Sort by lastPracticed descending (most recent first)
  recentMistakes.sort((a, b) => {
    const timeA = a.lastPracticed ? new Date(a.lastPracticed).getTime() : 0;
    const timeB = b.lastPracticed ? new Date(b.lastPracticed).getTime() : 0;
    return timeB - timeA;
  });

  return recentMistakes.slice(0, limit);
}

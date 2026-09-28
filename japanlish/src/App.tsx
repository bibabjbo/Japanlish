import React, { useState, useEffect, useMemo } from 'react';
import { AppNavbar } from './components/AppNavbar';
import { StartScreen } from './components/StartScreen';
import { VocabularyBankPage } from './components/VocabularyBankPage';
import { QuizPage } from './components/QuizPage';
import { ResultScreen } from './components/ResultScreen';
import { GuideModal } from './components/GuideModal';
import { StartLearningModal } from './components/StartLearningModal';
import { ImportCsvModal } from './components/ImportCsvModal';
import { KanaMode, QuizStats, VocabularyItem, QuizOptions } from './types/vocabulary';
import { shuffleQuestions } from './utils/kanaConverter';
import {
  loadVocabularyBank,
  saveVocabularyBank,
  updateSingleAnswerStats,
  clearVocabularyBank,
} from './utils/storage';
import {
  getNeedsReviewItems,
  getRecentIncorrectItems,
  getVocabularyStatus,
} from './utils/learningStats';

type AppScreen = 'home' | 'bank' | 'quiz' | 'result';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home');

  // Primary source of vocabulary: ONLY words from user-imported CSV files
  const [vocabularyBank, setVocabularyBank] = useState<VocabularyItem[]>([]);

  // Active quiz session states
  const [activeQuestions, setActiveQuestions] = useState<VocabularyItem[]>([]);
  const [activeMode, setActiveMode] = useState<KanaMode>('hiragana');
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);

  // Global modals
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState<boolean>(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState<boolean>(false);

  // Last quiz options for restart functionality
  const [lastQuizOptions, setLastQuizOptions] = useState<QuizOptions>({
    questionCount: 0,
    initialMode: 'hiragana',
    category: 'all',
    order: 'random',
  });

  // Load persistent vocabulary bank on mount (strictly CSV pool, never defaults)
  useEffect(() => {
    const bank = loadVocabularyBank();
    setVocabularyBank(bank);
  }, []);

  // Sync updates to localStorage
  const handleUpdateBank = (newBank: VocabularyItem[]) => {
    setVocabularyBank(newBank);
    saveVocabularyBank(newBank);
  };

  const handleClearBank = () => {
    const empty = clearVocabularyBank();
    setVocabularyBank(empty);
  };

  // Extract unique categories from current CSV bank
  const categories = useMemo(() => {
    const set = new Set<string>();
    vocabularyBank.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [vocabularyBank]);

  // Count items needing review or with poor accuracy
  const needsReviewCount = useMemo(() => {
    return vocabularyBank.filter((item) => {
      const s = getVocabularyStatus(item);
      return s === 'needs_review' || (item.timesPracticed && item.timesPracticed > 0 && (item.accuracy || 0) < 60);
    }).length;
  }, [vocabularyBank]);

  // Count items with mistakes recently
  const recentMistakesCount = useMemo(() => {
    return vocabularyBank.filter((item) => (item.incorrectCount || 0) > 0).length;
  }, [vocabularyBank]);

  // Update statistics after EVERY submitted answer
  const handleRecordAnswer = (question: VocabularyItem, isCorrect: boolean) => {
    const updatedBank = updateSingleAnswerStats(question.id || question.japanese, isCorrect);
    setVocabularyBank(updatedBank);
  };

  // Handle Starting a Quiz Session: Strictly drawn from the imported CSV pool
  const handleStartQuiz = (options: QuizOptions) => {
    // If no CSV has been imported, do NOT use default vocabulary!
    if (!vocabularyBank || vocabularyBank.length === 0) {
      alert('Vui lòng nhập file CSV để bắt đầu luyện tập.');
      setIsImportCsvOpen(true);
      return;
    }

    setLastQuizOptions(options);
    setActiveMode(options.initialMode);

    if (options.customItems && options.customItems.length > 0) {
      setActiveQuestions(
        options.order === 'random'
          ? shuffleQuestions(options.customItems)
          : options.customItems
      );
      setScreen('quiz');
      return;
    }

    // Vocabulary pool: ONLY words from the imported CSV
    let candidates = [...vocabularyBank];

    // Filter by category if selected
    if (options.category && options.category !== 'all') {
      const filtered = candidates.filter((item) => item.category === options.category);
      if (filtered.length > 0) {
        candidates = filtered;
      }
    }

    // Apply Order: Random vs Original CSV order
    let finalOrder = candidates;
    if (options.order === 'random') {
      finalOrder = shuffleQuestions(candidates);
    }

    // Question count: If CSV has 10 words, quiz tests 10 words. If 100, tests 100.
    const targetCount =
      options.questionCount && options.questionCount > 0 && options.questionCount < finalOrder.length
        ? options.questionCount
        : finalOrder.length;

    const selected = finalOrder.slice(0, targetCount);

    setActiveQuestions(selected);
    setScreen('quiz');
  };

  // Review Mode 1: ÔN TỪ CẦN ÔN (Filtered strictly from current CSV pool)
  const handleStartReviewNeedsReview = () => {
    if (!vocabularyBank || vocabularyBank.length === 0) {
      alert('Vui lòng nhập file CSV để bắt đầu luyện tập.');
      setIsImportCsvOpen(true);
      return;
    }
    const targetWords = getNeedsReviewItems(vocabularyBank, 20);
    if (targetWords.length === 0) {
      alert('Tất cả các từ trong kho hiện đều có độ chính xác tốt!');
      return;
    }
    setActiveQuestions(shuffleQuestions(targetWords));
    setActiveMode('hiragana');
    setScreen('quiz');
  };

  // Review Mode 2: ÔN TỪ SAI GẦN ĐÂY (Filtered strictly from current CSV pool)
  const handleStartReviewRecentIncorrect = () => {
    if (!vocabularyBank || vocabularyBank.length === 0) {
      alert('Vui lòng nhập file CSV để bắt đầu luyện tập.');
      setIsImportCsvOpen(true);
      return;
    }
    const targetWords = getRecentIncorrectItems(vocabularyBank, 20);
    if (targetWords.length === 0) {
      alert('Hiện chưa có từ nào bị làm sai gần đây!');
      return;
    }
    setActiveQuestions(targetWords);
    setActiveMode('hiragana');
    setScreen('quiz');
  };

  // Handle Quiz Completion
  const handleQuizFinish = (stats: QuizStats) => {
    setQuizStats(stats);
    setScreen('result');
  };

  // Handle Restart Quiz (Section 3: ÔN LẠI TỪ SAI)
  const handleRestartQuiz = (missedOnly: boolean = false) => {
    if (missedOnly && quizStats) {
      const missedQuestions = quizStats.results
        .filter((r) => !r.isCorrect)
        .map((r) => r.question);

      if (missedQuestions.length > 0) {
        setActiveQuestions(shuffleQuestions(missedQuestions));
        setScreen('quiz');
        return;
      }
    }

    // Otherwise repeat with the same options from vocabulary bank
    handleStartQuiz(lastQuizOptions);
  };

  // Navigation handlers
  const handleGoHome = () => {
    setScreen('home');
    setQuizStats(null);
  };

  const handleGoToBank = () => {
    setScreen('bank');
    setQuizStats(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FCFF] text-[#1F2937] font-sans flex flex-col justify-between selection:bg-[#E8F7FF] selection:text-[#0284c7]">
      {/* Top Navbar when not in active quiz */}
      {screen !== 'quiz' && (
        <AppNavbar
          currentTab={screen === 'bank' ? 'bank' : 'home'}
          onSelectTab={(tab) => setScreen(tab)}
          bankWordCount={vocabularyBank.length}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenStartLearningModal={() => {
            if (vocabularyBank.length === 0) {
              setIsImportCsvOpen(true);
            } else {
              setIsQuickStartOpen(true);
            }
          }}
        />
      )}

      {/* 1. Home / Practice Launcher Screen */}
      {screen === 'home' && (
        <main className="flex-1 flex flex-col justify-center">
          <StartScreen
            onStartQuiz={handleStartQuiz}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenBank={() => setScreen('bank')}
            onOpenImportCsv={() => setIsImportCsvOpen(true)}
            totalAvailableWords={vocabularyBank.length}
            categories={categories}
            needsReviewCount={needsReviewCount}
            recentMistakesCount={recentMistakesCount}
            onStartReviewNeedsReview={handleStartReviewNeedsReview}
            onStartReviewRecentIncorrect={handleStartReviewRecentIncorrect}
          />
        </main>
      )}

      {/* 2. KHO TỪ VỰNG (Vocabulary Bank Page) */}
      {screen === 'bank' && (
        <main className="flex-1">
          <VocabularyBankPage
            vocabularyBank={vocabularyBank}
            onUpdateBank={handleUpdateBank}
            onClearBank={handleClearBank}
            onStartLearning={handleStartQuiz}
            onStartReviewNeedsReview={handleStartReviewNeedsReview}
            onStartReviewRecentIncorrect={handleStartReviewRecentIncorrect}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        </main>
      )}

      {/* 3. Quiz Page (Preserves exact focused UI and two-step Enter feedback) */}
      {screen === 'quiz' && (
        <QuizPage
          questions={activeQuestions}
          initialMode={activeMode}
          onFinish={handleQuizFinish}
          onExitToHome={handleGoHome}
          onRecordAnswer={handleRecordAnswer}
        />
      )}

      {/* 4. Result Screen */}
      {screen === 'result' && quizStats && (
        <main className="flex-1 flex flex-col justify-center">
          <ResultScreen
            stats={quizStats}
            onRestart={handleRestartQuiz}
            onGoHome={handleGoHome}
            onGoToBank={handleGoToBank}
          />
        </main>
      )}

      {/* Romaji Typing Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Quick Start Modal from Navbar */}
      <StartLearningModal
        isOpen={isQuickStartOpen}
        totalWords={vocabularyBank.length}
        availableCategories={categories}
        onClose={() => setIsQuickStartOpen(false)}
        onConfirmStart={handleStartQuiz}
        onOpenImportCsv={() => setIsImportCsvOpen(true)}
      />

      {/* Direct CSV Import Modal */}
      <ImportCsvModal
        isOpen={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
        onImportCompleted={(result) => {
          if (result.successCount > 0) {
            handleUpdateBank(result.importedItems);
          }
        }}
      />
    </div>
  );
}

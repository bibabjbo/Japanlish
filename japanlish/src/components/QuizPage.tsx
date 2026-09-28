import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from './Header';
import { ModeSelector } from './ModeSelector';
import { KanaInput } from './KanaInput';
import { FeedbackCard } from './FeedbackCard';
import { ExitModal } from './ExitModal';
import { GuideModal } from './GuideModal';
import {
  VocabularyItem,
  KanaMode,
  QuizState,
  QuestionResult,
  QuizStats,
} from '../types/vocabulary';
import { checkAnswer, romajiToKana, convertKanaMode } from '../utils/kanaConverter';
import { soundManager } from '../utils/sound';

interface QuizPageProps {
  questions: VocabularyItem[];
  initialMode: KanaMode;
  onFinish: (stats: QuizStats) => void;
  onExitToHome: () => void;
  onRecordAnswer?: (question: VocabularyItem, isCorrect: boolean) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  questions,
  initialMode,
  onFinish,
  onExitToHome,
  onRecordAnswer,
}) => {
  // Explicit Quiz States: ANSWERING | CORRECT_FEEDBACK | INCORRECT_FEEDBACK | FINISHED
  const [quizState, setQuizState] = useState<QuizState>('ANSWERING');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<KanaMode>(initialMode);
  const [inputValue, setInputValue] = useState<string>('');
  const [emptyWarning, setEmptyWarning] = useState<boolean>(false);

  const [lastSubmissionResult, setLastSubmissionResult] = useState<{
    isCorrect: boolean;
    userAnswer: string;
  } | null>(null);

  // Timestamp guard for robust Double Enter protection (minimum 200ms between transitions)
  const lastTransitionTimeRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);

  const resultsRef = useRef<QuestionResult[]>([]);
  const [, setResults] = useState<QuestionResult[]>([]);

  // Continuous timer (runs during answering and feedback states)
  const [seconds, setSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & sound settings
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Continuous timer initialization
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQuestion = questions[currentIndex];

  // Enter #2: Move to next question or complete quiz
  const advanceToNext = useCallback(() => {
    const now = Date.now();
    if (now - lastTransitionTimeRef.current < 200 || isTransitioningRef.current) {
      return;
    }
    isTransitioningRef.current = true;
    lastTransitionTimeRef.current = now;

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setInputValue('');
      setEmptyWarning(false);
      setLastSubmissionResult(null);
      setQuizState('ANSWERING');
      isTransitioningRef.current = false;
    } else {
      // Quiz completed!
      if (timerRef.current) clearInterval(timerRef.current);
      setQuizState('FINISHED');
      isTransitioningRef.current = false;

      const total = questions.length;
      const allResults = resultsRef.current;
      const correctCount = allResults.filter(r => r.isCorrect).length;
      const incorrectCount = total - correctCount;
      const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

      onFinish({
        total,
        correct: correctCount,
        incorrect: incorrectCount,
        accuracy,
        timeSpentSeconds: seconds,
        results: allResults,
      });
    }
  }, [currentIndex, questions.length, onFinish, seconds]);

  // Enter #1: Submit current answer from ANSWERING state
  const handleSubmitAnswer = useCallback(() => {
    // Concurrency guard: Only submit when in ANSWERING state
    if (quizState !== 'ANSWERING' || isTransitioningRef.current) return;
    if (!currentQuestion) return;

    // Check empty answer requirement:
    // If user presses Enter without typing anything:
    // Do NOT enter feedback state. Show "Vui lòng nhập đáp án" and remain in ANSWERING.
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setEmptyWarning(true);
      return;
    }

    const now = Date.now();
    if (now - lastTransitionTimeRef.current < 200) return;
    isTransitioningRef.current = true;
    lastTransitionTimeRef.current = now;

    setEmptyWarning(false);

    // Finalize any trailing romaji (e.g. 'n' -> 'ん', 'ka' -> 'か')
    const finalized = romajiToKana(inputValue, currentMode, true);
    const correct = checkAnswer(finalized, currentQuestion, currentMode);

    setInputValue(finalized);

    const newResult: QuestionResult = {
      question: currentQuestion,
      userAnswer: finalized,
      isCorrect: correct,
      mode: currentMode,
    };

    resultsRef.current.push(newResult);
    setResults(prev => [...prev, newResult]);
    setLastSubmissionResult({
      isCorrect: correct,
      userAnswer: finalized,
    });

    // Real-time update of learning statistics after every submitted answer
    if (onRecordAnswer) {
      onRecordAnswer(currentQuestion, correct);
    }

    if (correct) {
      soundManager.playCorrect();
      // STAYS on current question! Wait for Enter #2 or "Tiếp tục"
      setQuizState('CORRECT_FEEDBACK');
    } else {
      soundManager.playIncorrect();
      // STAYS on current question! Wait for Enter #2 or "Tiếp tục"
      setQuizState('INCORRECT_FEEDBACK');

      // Auto speak Japanese pronunciation for learning
      setTimeout(() => {
        soundManager.speakJapanese(currentQuestion.japanese || currentQuestion.hiragana);
      }, 150);
    }

    isTransitioningRef.current = false;
  }, [quizState, currentQuestion, inputValue, currentMode, onRecordAnswer]);

  // Global enter key listener for feedback states (Enter #2)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isExitModalOpen || isGuideModalOpen) return;

        // When in feedback state (CORRECT_FEEDBACK or INCORRECT_FEEDBACK):
        // Pressing Enter acts as Enter #2 -> advances to next question.
        if (quizState === 'CORRECT_FEEDBACK' || quizState === 'INCORRECT_FEEDBACK') {
          e.preventDefault();
          e.stopPropagation();
          advanceToNext();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [quizState, isExitModalOpen, isGuideModalOpen, advanceToNext]);

  // Handle live input change (clears empty warning if user types)
  const handleInputChange = (newVal: string) => {
    if (emptyWarning) setEmptyWarning(false);
    setInputValue(newVal);
  };

  // Handle mode change & seamlessly convert current input if present
  const handleChangeMode = (newMode: KanaMode) => {
    if (quizState !== 'ANSWERING') return;
    setCurrentMode(newMode);
    if (inputValue) {
      setInputValue(convertKanaMode(inputValue, newMode));
    }
  };

  const handleToggleMode = () => {
    const next = currentMode === 'hiragana' ? 'katakana' : 'hiragana';
    handleChangeMode(next);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundManager.setSoundEnabled(nextState);
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-[#F8FCFF] text-[#1F2937] flex flex-col justify-between select-none">
      {/* Top Header with Progress and Timer */}
      <Header
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        timeSeconds={seconds}
        onExit={() => setIsExitModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Learning Center Area */}
      <main className="w-full max-w-md sm:max-w-lg mx-auto px-4 py-4 flex flex-col items-center justify-center flex-1 my-auto">
        <div className="w-full flex flex-col items-center space-y-4">
          {/* Vietnamese Meaning Prompt */}
          <div className="text-center pt-2 pb-1">
            <span className="text-[11px] font-bold text-[#64748B] tracking-widest uppercase block mb-1">
              NGHĨA TIẾNG VIỆT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] tracking-tight">
              {currentQuestion.vietnamese}
            </h2>
            {currentQuestion.exampleVi && (
              <p className="text-sm text-[#64748B] font-medium mt-1">
                {currentQuestion.exampleVi}
              </p>
            )}
          </div>

          {/* Mode Selector */}
          <ModeSelector
            mode={currentMode}
            onChangeMode={handleChangeMode}
            disabled={quizState !== 'ANSWERING'}
          />

          {/* Large White Japanese Input Area (remains visible during feedback) */}
          <div className="w-full">
            <KanaInput
              key={currentIndex}
              value={inputValue}
              onChange={handleInputChange}
              onSubmit={handleSubmitAnswer}
              mode={currentMode}
              onToggleMode={handleToggleMode}
              quizState={quizState}
              questionIndex={currentIndex}
              emptyWarning={emptyWarning}
            />

            {/* Empty Answer Warning */}
            {emptyWarning && quizState === 'ANSWERING' && (
              <div className="text-xs font-semibold text-amber-600 animate-in fade-in duration-150 flex items-center justify-center gap-1.5 mt-2.5">
                <AlertCircle size={14} />
                <span>Vui lòng nhập đáp án</span>
              </div>
            )}
          </div>

          {/* Action Zone: State-based UI */}
          <div className="w-full pt-1">
            {/* 1. State = ANSWERING */}
            {quizState === 'ANSWERING' && (
              <div className="w-full flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-[#E8F7FF] border border-[#D7EEF9] text-[#0284c7] font-bold text-sm sm:text-base transition-all shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  Đã gõ xong từ
                </button>
                <p className="text-xs text-[#64748B] text-center mt-2.5">
                  Nhấn Enter để kiểm tra từ đã gõ.
                </p>
              </div>
            )}

            {/* 2. State = CORRECT_FEEDBACK: Green success feedback card + [ Tiếp tục ] + Nhấn Enter để sang từ tiếp theo */}
            {quizState === 'CORRECT_FEEDBACK' && (
              <div className="w-full flex flex-col items-center space-y-3.5 animate-in fade-in duration-150">
                {lastSubmissionResult && (
                  <FeedbackCard
                    isCorrect={true}
                    userAnswer={lastSubmissionResult.userAnswer}
                    question={currentQuestion}
                    mode={currentMode}
                  />
                )}

                {/* Continue button: advances on click or on Enter key */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={advanceToNext}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white font-extrabold text-base transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Tiếp tục</span>
                  </button>
                  <p className="text-xs text-[#64748B] text-center mt-2">
                    Nhấn Enter để sang từ tiếp theo.
                  </p>
                </div>
              </div>
            )}

            {/* 3. State = INCORRECT_FEEDBACK: Red feedback card + [ Tiếp tục ] + Nhấn Enter để sang từ tiếp theo */}
            {quizState === 'INCORRECT_FEEDBACK' && (
              <div className="w-full flex flex-col items-center space-y-3.5 animate-in fade-in duration-150">
                {lastSubmissionResult && (
                  <FeedbackCard
                    isCorrect={false}
                    userAnswer={lastSubmissionResult.userAnswer}
                    question={currentQuestion}
                    mode={currentMode}
                  />
                )}

                {/* Continue button: advances on click or on Enter key */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={advanceToNext}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#5BC0EB] hover:bg-[#38bdf8] text-white font-extrabold text-base transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Tiếp tục</span>
                  </button>
                  <p className="text-xs text-[#64748B] text-center mt-2">
                    Nhấn Enter để sang từ tiếp theo.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Subtle bottom info bar */}
      <footer className="w-full max-w-md sm:max-w-lg mx-auto px-4 py-3 flex items-center justify-between text-[11px] text-[#64748B]">
        <div>
          Phím tắt: <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#D7EEF9] text-slate-700 font-mono shadow-xs">Tab</kbd> đổi bộ gõ • <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#D7EEF9] text-slate-700 font-mono shadow-xs">Enter</kbd> nộp bài / tiếp tục
        </div>
        <div>
          {currentQuestion.category && (
            <span className="text-[#0284c7] font-semibold">#{currentQuestion.category}</span>
          )}
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      <ExitModal
        isOpen={isExitModalOpen}
        onCancel={() => setIsExitModalOpen(false)}
        onConfirm={() => {
          setIsExitModalOpen(false);
          onExitToHome();
        }}
      />

      {/* Typing & Romaji Guide Modal */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
};

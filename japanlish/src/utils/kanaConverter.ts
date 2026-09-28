import * as wanakana from 'wanakana';
import { KanaMode, VocabularyItem } from '../types/vocabulary';

/**
 * Normalizes intermediate text during real-time typing to resolve
 * common typing sequences (e.g. when 'n' + vowel is typed, or 'nn' is typed)
 */
function resolveTypingSequences(text: string, mode: KanaMode): string {
  let s = text;

  // Hiragana mappings for n + vowel/y
  s = s
    .replace(/んa/gi, 'な')
    .replace(/んi/gi, 'に')
    .replace(/んu/gi, 'ぬ')
    .replace(/んe/gi, 'ね')
    .replace(/んo/gi, 'の')
    .replace(/んya/gi, 'にゃ')
    .replace(/んyu/gi, 'にゅ')
    .replace(/んyo/gi, 'にょ');

  // Katakana mappings for n + vowel/y
  s = s
    .replace(/ンa/gi, 'ナ')
    .replace(/ンi/gi, 'ニ')
    .replace(/ンu/gi, 'ヌ')
    .replace(/ンe/gi, 'ネ')
    .replace(/ンo/gi, 'ノ')
    .replace(/ンya/gi, 'ニャ')
    .replace(/ンyu/gi, 'ニュ')
    .replace(/ンyo/gi, 'ニョ');

  // Convert double n to single ん/ン
  s = s.replace(/nn/gi, mode === 'hiragana' ? 'ん' : 'ン');

  return s;
}

/**
 * Converts English Romaji input to Japanese Kana (Hiragana or Katakana)
 * in real-time as the user types on a standard keyboard.
 *
 * Supports:
 * - Basic sounds: a, i, u, e, o, ka, ki, ku, ke, ko, shi, chi, tsu, fu...
 * - Dakuten/Handakuten: ga, za, da, ba, pa...
 * - Contracted sounds (yōon): kya, sha, cha, nya, hya, mya, rya, gya, bya, pya...
 * - Double consonants (sokuon / small っ/ッ): kitte -> きって, gakkou -> がっこう
 * - Syllabic n: shashin -> しゃしん / シャシン, hon -> ほん
 * - Long vowels & Katakana chōonpu (- -> ー)
 */
export function romajiToKana(input: string, mode: KanaMode, isFinal: boolean = true): string {
  if (!input) return '';

  let resolved = resolveTypingSequences(input, mode);

  // If isFinal is true (e.g. on Enter, or when converting complete words like 'shashin')
  // or if input ends with 'n' preceded by a vowel or consonant, convert trailing 'n'
  if (isFinal) {
    if (/n$/i.test(resolved)) {
      resolved = resolved.slice(0, -1) + (mode === 'hiragana' ? 'ん' : 'ン');
    }
  }

  // Convert using wanakana
  let kana = mode === 'hiragana'
    ? wanakana.toHiragana(resolved, { IMEMode: !isFinal })
    : wanakana.toKatakana(resolved, { IMEMode: !isFinal });

  // If finalized or user typed a word ending with 'n', guarantee trailing 'n' is converted
  if (isFinal) {
    if (mode === 'hiragana') {
      kana = kana.replace(/n$/i, 'ん');
    } else {
      kana = kana.replace(/n$/i, 'ン');
    }
  }

  // Final check for any resolved sequences in the converted string
  return resolveTypingSequences(kana, mode);
}

/**
 * Converts existing Kana text between Hiragana and Katakana
 */
export function convertKanaMode(text: string, targetMode: KanaMode): string {
  if (!text) return '';
  return targetMode === 'katakana' ? wanakana.toKatakana(text) : wanakana.toHiragana(text);
}

/**
 * Normalizes text for comparison (strips whitespace, normalizes fullwidth/halfwidth)
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '')
    .replace(/[ー−―]/g, 'ー');
}

/**
 * Checks whether the user's typed kana or romaji matches the vocabulary item.
 * Evaluates against Hiragana, Katakana, Kanji, and alternative valid answers.
 */
export function checkAnswer(
  userInput: string,
  item: VocabularyItem,
  mode: KanaMode
): boolean {
  if (!userInput || !userInput.trim()) return false;

  const normalizedUser = normalizeText(userInput);

  // Also convert finalized forms in case romaji was entered
  const finalizedHiragana = normalizeText(romajiToKana(userInput, 'hiragana', true));
  const finalizedKatakana = normalizeText(romajiToKana(userInput, 'katakana', true));

  // Build list of all valid answers
  const acceptableAnswers: string[] = [
    normalizeText(item.hiragana),
    normalizeText(item.katakana),
    normalizeText(item.japanese),
    normalizeText(item.romaji),
  ];

  if (item.altAnswers && item.altAnswers.length > 0) {
    for (const alt of item.altAnswers) {
      acceptableAnswers.push(normalizeText(alt));
      acceptableAnswers.push(normalizeText(wanakana.toHiragana(alt)));
      acceptableAnswers.push(normalizeText(wanakana.toKatakana(alt)));
      acceptableAnswers.push(normalizeText(wanakana.toRomaji(alt)));
    }
  }

  return acceptableAnswers.some(ans =>
    ans === normalizedUser ||
    ans === finalizedHiragana ||
    ans === finalizedKatakana
  );
}

/**
 * Fisher-Yates shuffle algorithm for randomizing questions without mutation
 */
export function shuffleQuestions<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Formats seconds into MM:SS format (e.g., 00:04, 01:23)
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

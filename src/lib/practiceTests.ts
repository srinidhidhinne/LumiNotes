import { supabase } from '@/lib/supabase';
import { AI_NOT_CONFIGURED } from '@/lib/studyNotes';
import { readFunctionError } from '@/lib/functionErrors';
import type { PracticeQuestion } from '@/types/practiceTest';

const OPTION_COUNT = 4;

function isPracticeQuestion(value: unknown): value is PracticeQuestion {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.question === 'string' &&
    typeof item.explanation === 'string' &&
    Array.isArray(item.options) &&
    item.options.length === OPTION_COUNT &&
    item.options.every((option) => typeof option === 'string') &&
    Number.isInteger(item.correctIndex) &&
    (item.correctIndex as number) >= 0 &&
    (item.correctIndex as number) < OPTION_COUNT
  );
}

function normalizeQuestions(value: unknown): PracticeQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isPracticeQuestion);
}

export async function getPracticeTest(documentId: string): Promise<PracticeQuestion[] | null> {
  const { data, error } = await supabase
    .from('practice_tests')
    .select('questions')
    .eq('document_id', documentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const questions = normalizeQuestions(data.questions);
  return questions.length > 0 ? questions : null;
}

export async function generatePracticeTest(documentId: string): Promise<PracticeQuestion[]> {
  const { data, error } = await supabase.functions.invoke('generate-practice-test', {
    body: { documentId },
  });

  if (error) throw new Error(await readFunctionError(error));

  const questions = normalizeQuestions((data as { questions?: unknown } | null)?.questions);
  if (questions.length === 0) {
    throw new Error('The practice test could not be generated. Please try again.');
  }
  return questions;
}

export function describePracticeError(message: string): string {
  if (message === AI_NOT_CONFIGURED) {
    return 'AI practice tests are not switched on yet. The project needs an AI key before tests can be created.';
  }
  return message;
}

import { useState } from 'react';
import { Check, RotateCw, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PracticeQuestion } from '@/types/practiceTest';

const LETTERS = ['A', 'B', 'C', 'D'];

interface PracticeQuizProps {
  questions: PracticeQuestion[];
  onRegenerate: () => void;
}

function optionClasses(isAnswered: boolean, isCorrect: boolean, isChosen: boolean): string {
  if (isAnswered && isCorrect) return 'border-emerald-500 bg-emerald-50 text-emerald-900';
  if (isAnswered && isChosen) return 'border-red-500 bg-red-50 text-red-900';
  if (isAnswered) return 'border-navy-100 bg-white text-navy-500';
  return 'border-navy-200 bg-white text-navy-900 hover:border-sky-400 hover:bg-sky-50/50';
}

export function PracticeQuiz({ questions, onRegenerate }: PracticeQuizProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const current = questions[index];
  const isAnswered = selected !== null;
  const isCorrect = selected === current.correctIndex;

  const choose = (optionIndex: number) => {
    if (isAnswered) return;
    setSelected(optionIndex);
    if (optionIndex === current.correctIndex) setScore((value) => value + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setIsFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-card">
        <p className="text-sm font-medium text-navy-500">Your score</p>
        <p className="mt-2 text-5xl font-semibold text-navy-900">
          {score} / {questions.length}
        </p>
        <p className="mt-3 text-navy-600">
          {percent >= 80 ? 'Excellent work. You know this material well.' : 'Review the explanations and try again to improve.'}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={restart}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Retake test
          </Button>
          <Button variant="secondary" onClick={onRegenerate}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Generate new questions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-100">
          <div
            className="h-full rounded-full bg-sky-600 transition-all duration-500"
            style={{ width: `${Math.round(((index + 1) / questions.length) * 100)}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-navy-600" aria-live="polite">
          Question {index + 1} of {questions.length}
        </span>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <h3 className="text-lg font-semibold leading-snug text-navy-900">{current.question}</h3>

        <div className="mt-6 space-y-3" role="group" aria-label="Answer options">
          {current.options.map((option, optionIndex) => {
            const isChosen = selected === optionIndex;
            const isOptionCorrect = optionIndex === current.correctIndex;
            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() => choose(optionIndex)}
                aria-pressed={isChosen}
                className={`flex w-full items-start gap-4 rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition-colors duration-200 ${optionClasses(isAnswered, isOptionCorrect, isChosen)}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-xs font-semibold text-navy-800">
                  {LETTERS[optionIndex]}
                </span>
                <span className="flex-1 pt-0.5">{option}</span>
                {isAnswered && isOptionCorrect && <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />}
                {isAnswered && isChosen && !isOptionCorrect && <X className="mt-1 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div
            role="status"
            className={`mt-6 rounded-xl px-4 py-4 text-sm leading-relaxed ${isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900'}`}
          >
            <p className="font-semibold">{isCorrect ? 'Correct!' : 'Not quite.'}</p>
            <p className="mt-1 text-navy-800">{current.explanation}</p>
          </div>
        )}
      </div>

      {isAnswered && (
        <div className="flex justify-end">
          <Button onClick={next}>{index + 1 >= questions.length ? 'See results' : 'Next question'}</Button>
        </div>
      )}
    </div>
  );
}

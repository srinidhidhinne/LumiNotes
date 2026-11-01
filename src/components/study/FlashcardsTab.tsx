import { useEffect, useMemo, useState } from 'react';
import { BookmarkCheck, BookOpen, ChevronLeft, ChevronRight, Bookmark, RotateCw, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBookmarks } from '@/hooks/useBookmarks';
import { buildFlashcards, shuffleCards } from '@/lib/flashcards';
import { toneFor } from '@/lib/topicTones';
import type { StudyNoteSection } from '@/types/studyNotes';

interface FlashcardsTabProps {
  documentId: string;
  sections: StudyNoteSection[];
}

export function FlashcardsTab({ documentId, sections }: FlashcardsTabProps) {
  const cards = useMemo(() => buildFlashcards(sections), [sections]);
  const bookmarks = useBookmarks();
  const [shuffleSeed, setShuffleSeed] = useState<number | null>(null);
  const deck = useMemo(() => (shuffleSeed === null ? cards : shuffleCards(cards)), [cards, shuffleSeed]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const safeIndex = Math.min(index, Math.max(deck.length - 1, 0));
  const current = deck[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex >= deck.length - 1;
  const isSaved = current ? bookmarks.isSaved(documentId, current.term) : false;
  const tone = toneFor(safeIndex);

  const goTo = (next: number) => {
    setIndex(next);
    setIsFlipped(false);
  };

  const shuffle = () => {
    setShuffleSeed(Date.now());
    goTo(0);
  };

  useEffect(() => {
    if (deck.length === 0) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.tagName === 'BUTTON') return;
      if (event.key === 'ArrowRight' && !isLast) goTo(safeIndex + 1);
      else if (event.key === 'ArrowLeft' && !isFirst) goTo(safeIndex - 1);
      else if (event.key === ' ') {
        event.preventDefault();
        setIsFlipped((flipped) => !flipped);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [deck.length, isFirst, isLast, safeIndex]);

  if (!current) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No flashcards yet"
        description="Flashcards are made from the important terms in your notes. Generate notes in the Complete Notes tab first."
      />
    );
  }

  const progress = Math.round(((safeIndex + 1) / deck.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-navy-900">Practice key terms</h3>
          <p className="mt-1 text-sm text-navy-500">
            Try to recall the meaning, then flip the card to check yourself.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void bookmarks.toggle(documentId, current)}
            disabled={bookmarks.isLoading}
            aria-pressed={isSaved}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-sky-700" aria-hidden="true" />
            ) : (
              <Bookmark className="h-4 w-4" aria-hidden="true" />
            )}
            {isSaved ? 'Saved' : 'Save term'}
          </Button>
          <Button variant="secondary" size="sm" onClick={shuffle}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle
          </Button>
        </div>
      </div>

      {bookmarks.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {bookmarks.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${tone.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-navy-600" aria-live="polite">
          {safeIndex + 1} of {deck.length}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setIsFlipped((flipped) => !flipped)}
        aria-label={isFlipped ? 'Show term' : 'Show meaning'}
        className="group relative block h-72 w-full rounded-2xl text-left [perspective:1200px] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      >
        <div
          className="relative h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d]"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border ${tone.border} ${tone.soft} p-8 text-center shadow-card [backface-visibility:hidden]`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${tone.accent}`}>{current.topic}</p>
            <p className="mt-4 text-2xl font-semibold leading-snug text-navy-900">{current.term}</p>
            <p className="mt-6 text-sm text-navy-500">Click or press Space to flip</p>
          </div>
          <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-2xl p-8 text-center shadow-card [backface-visibility:hidden] [transform:rotateY(180deg)] ${tone.strong}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-white">Meaning</p>
            <p className="mt-4 text-base leading-relaxed text-white">{current.meaning}</p>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => goTo(safeIndex - 1)} disabled={isFirst}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setIsFlipped((flipped) => !flipped)}>
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Flip
        </Button>
        <Button size="sm" onClick={() => goTo(safeIndex + 1)} disabled={isLast}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

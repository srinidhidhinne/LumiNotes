import { AlertTriangle, BookOpen, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { NoteTopicCard } from '@/components/study/NoteTopicCard';
import { AI_NOT_CONFIGURED } from '@/lib/studyNotes';
import { toneFor } from '@/lib/topicTones';
import type { StudyNotesState } from '@/hooks/useStudyNotes';

interface CompleteNotesTabProps {
  notes: StudyNotesState;
}

function describeError(message: string): string {
  if (message === AI_NOT_CONFIGURED) {
    return 'AI note generation is not switched on yet. The project needs an AI key before notes can be created.';
  }
  return message;
}

export function CompleteNotesTab({ notes }: CompleteNotesTabProps) {
  const { sections, status, progress, error, hasPartialNotes, generate } = notes;
  const isGenerating = status === 'generating';
  const hasNotes = sections.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-navy-900">Topic-wise explanations</h3>
          <p className="mt-1 text-sm text-navy-500">
            Notes are written section by section from your uploaded file, so every topic is explained in order.
          </p>
        </div>
        {hasNotes && !isGenerating && (
          <Button variant="secondary" size="sm" onClick={() => void generate(true)} className="shrink-0">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Regenerate all
          </Button>
        )}
      </div>

      {status === 'loading' && (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-navy-100/60" />
          ))}
        </div>
      )}

      {isGenerating && progress && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5" role="status">
          <div className="flex items-center gap-3 text-sm font-medium text-navy-800">
            <Loader2 className="h-4 w-4 animate-spin text-sky-700" aria-hidden="true" />
            {progress.total
              ? `Writing section ${progress.done + 1} of ${progress.total}...`
              : 'Reading your file and writing the first section...'}
          </div>
          {progress.total !== null && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-sky-600 transition-all duration-500"
                style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
              />
            </div>
          )}
          {progress.currentLabel && (
            <p className="mt-3 text-xs text-navy-500">Last finished: {progress.currentLabel}</p>
          )}
        </div>
      )}

      {status === 'error' && error && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{describeError(error)}</span>
          </div>
          {error !== AI_NOT_CONFIGURED && (
            <Button variant="secondary" size="sm" onClick={() => void generate(!hasPartialNotes)} className="shrink-0">
              {hasPartialNotes ? 'Continue' : 'Try again'}
            </Button>
          )}
        </div>
      )}

      {!hasNotes && !isGenerating && status !== 'loading' && status !== 'error' && (
        <EmptyState
          icon={BookOpen}
          title="No notes yet"
          description="Generate notes to turn this document into topic-by-topic explanations with key points and terms."
          action={
            <Button onClick={() => void generate(true)}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Generate notes
            </Button>
          }
        />
      )}

      {hasNotes && (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.chunk_index} aria-label={section.label} className="space-y-3">
              <h3
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${toneFor(section.chunk_index).chip}`}
              >
                {section.label}
              </h3>
              {section.topics.length === 0 && (
                <p className="rounded-xl bg-navy-50 px-4 py-3 text-sm text-navy-600">
                  No topics could be drawn from this section.
                </p>
              )}
              {section.topics.map((topic, index) => (
                <NoteTopicCard
                  key={`${section.chunk_index}-${index}`}
                  topic={topic}
                  tone={toneFor(section.chunk_index + index)}
                  defaultOpen={index === 0 && section.chunk_index === 0}
                />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

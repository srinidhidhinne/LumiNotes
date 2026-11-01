import { Check, Circle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DocumentProgress } from '@/lib/studyLibrary';
import type { DocumentSummary } from '@/types/document';

interface LibraryDocumentRowProps {
  document: DocumentSummary;
  progress: DocumentProgress;
  onOpen: (document: DocumentSummary) => void;
}

function StatusPill({ isReady, readyLabel, pendingLabel }: { isReady: boolean; readyLabel: string; pendingLabel: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isReady ? 'bg-emerald-50 text-emerald-800' : 'bg-navy-100 text-navy-600'
      }`}
    >
      {isReady ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Circle className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {isReady ? readyLabel : pendingLabel}
    </span>
  );
}

export function LibraryDocumentRow({ document, progress, onOpen }: LibraryDocumentRowProps) {
  const context = [document.chapter, document.file_name].filter(Boolean).join(' / ');
  const hasNotes = progress.noteSections > 0;

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-navy-900" title={document.title}>
          {document.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-navy-500">{context}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            isReady={hasNotes}
            readyLabel={`Notes · ${progress.noteSections} ${progress.noteSections === 1 ? 'section' : 'sections'}`}
            pendingLabel="No notes yet"
          />
          <StatusPill isReady={progress.hasPracticeTest} readyLabel="Practice test ready" pendingLabel="No practice test" />
          <StatusPill
            isReady={progress.savedTerms > 0}
            readyLabel={`${progress.savedTerms} saved ${progress.savedTerms === 1 ? 'term' : 'terms'}`}
            pendingLabel="No saved terms"
          />
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={() => onOpen(document)} className="shrink-0 self-start sm:self-center">
        <Eye className="h-4 w-4" aria-hidden="true" />
        Open
      </Button>
    </li>
  );
}

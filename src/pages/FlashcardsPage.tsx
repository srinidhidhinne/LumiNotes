import { useState } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { DocumentSelect } from '@/components/documents/DocumentSelect';
import { FlashcardsTab } from '@/components/study/FlashcardsTab';
import { useDocuments } from '@/hooks/useDocuments';
import { useStudyNotes } from '@/hooks/useStudyNotes';
import type { DocumentSummary } from '@/types/document';

function DocumentFlashcards({ documentId }: { documentId: string }) {
  const notes = useStudyNotes(documentId);

  if (notes.status === 'loading') {
    return <div className="h-72 animate-pulse rounded-2xl bg-navy-100/60" aria-busy="true" />;
  }

  if (notes.status === 'error' && notes.sections.length === 0) {
    return (
      <div role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
        {notes.error}
      </div>
    );
  }

  if (notes.sections.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No notes for this document yet"
        description="Open this document from My Documents and generate its notes to create flashcards."
      />
    );
  }

  return <FlashcardsTab documentId={documentId} sections={notes.sections} />;
}

export function FlashcardsPage() {
  const { documents, isLoading, error, reload } = useDocuments();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected: DocumentSummary | undefined =
    documents.find((doc) => doc.id === selectedId) ?? documents[0];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-sky-600">Flashcards</p>
        <h1 className="text-3xl font-semibold tracking-tight text-navy-900">Practice your key terms</h1>
        <p className="max-w-2xl text-navy-500">Choose a document to review the terms from its notes.</p>
      </header>

      {isLoading && <div className="h-12 animate-pulse rounded-xl bg-navy-100/60" aria-busy="true" />}

      {!isLoading && error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          <span>Your documents could not be loaded. {error}</span>
          <button type="button" onClick={reload} className="font-medium underline">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && documents.length === 0 && (
        <EmptyState
          icon={Layers}
          title="No documents yet"
          description="Upload a chapter and generate its notes to start practicing flashcards."
        />
      )}

      {!isLoading && !error && selected && (
        <div className="space-y-8">
          <DocumentSelect documents={documents} value={selected.id} onChange={setSelectedId} />

          <DocumentFlashcards key={selected.id} documentId={selected.id} />
        </div>
      )}
    </div>
  );
}

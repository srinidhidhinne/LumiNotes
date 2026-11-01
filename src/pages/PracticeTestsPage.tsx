import { useState } from 'react';
import { AlertTriangle, ClipboardCheck, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { DocumentSelect } from '@/components/documents/DocumentSelect';
import { PracticeQuiz } from '@/components/study/PracticeQuiz';
import { useDocuments } from '@/hooks/useDocuments';
import { useGeneratedContent, type GeneratedContentSource } from '@/hooks/useGeneratedContent';
import { describePracticeError, generatePracticeTest, getPracticeTest } from '@/lib/practiceTests';
import type { PracticeQuestion } from '@/types/practiceTest';
import type { DocumentSummary } from '@/types/document';

const PRACTICE_SOURCE: GeneratedContentSource<PracticeQuestion[]> = {
  load: getPracticeTest,
  generate: generatePracticeTest,
  loadErrorMessage: 'Your practice test could not be loaded.',
  generateErrorMessage: 'The practice test could not be generated.',
};

function DocumentPracticeTest({ documentId }: { documentId: string }) {
  const practice = useGeneratedContent(documentId, PRACTICE_SOURCE);

  if (practice.status === 'loading') {
    return <div className="h-72 animate-pulse rounded-2xl bg-navy-100/60" aria-busy="true" />;
  }

  if (practice.status === 'generating') {
    return (
      <div className="rounded-2xl border border-sky-100 bg-sky-50 p-8 text-center" role="status">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-sky-700" aria-hidden="true" />
        <p className="mt-4 font-medium text-navy-800">Writing your practice questions...</p>
        <p className="mt-1 text-sm text-navy-500">This usually takes under a minute.</p>
      </div>
    );
  }

  if (practice.status === 'error') {
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{describePracticeError(practice.error ?? 'The practice test could not be loaded.')}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void practice.generate()} className="shrink-0">
          Try again
        </Button>
      </div>
    );
  }

  if (!practice.content) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No practice test yet"
        description="Create a multiple-choice test from this document to check what you have learned."
        action={
          <Button onClick={() => void practice.generate()}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Create practice test
          </Button>
        }
      />
    );
  }

  return <PracticeQuiz questions={practice.content} onRegenerate={() => void practice.generate()} />;
}

export function PracticeTestsPage() {
  const { documents, isLoading, error, reload } = useDocuments();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected: DocumentSummary | undefined =
    documents.find((doc) => doc.id === selectedId) ?? documents[0];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-sky-600">Practice Tests</p>
        <h1 className="text-3xl font-semibold tracking-tight text-navy-900">Test what you have learned</h1>
        <p className="max-w-2xl text-navy-500">Answer multiple-choice questions from a document and see an explanation for each answer.</p>
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
          icon={ClipboardCheck}
          title="No documents yet"
          description="Upload a chapter first, then create a practice test from it."
        />
      )}

      {!isLoading && !error && selected && (
        <div className="space-y-8">
          <DocumentSelect documents={documents} value={selected.id} onChange={setSelectedId} />
          <DocumentPracticeTest key={selected.id} documentId={selected.id} />
        </div>
      )}
    </div>
  );
}

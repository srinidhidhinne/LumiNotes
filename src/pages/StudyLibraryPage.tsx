import { useMemo, useState } from 'react';
import { BookOpen, ClipboardCheck, FileText } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { LibraryDocumentRow } from '@/components/library/LibraryDocumentRow';
import { StudyWorkspaceDialog } from '@/components/study/StudyWorkspaceDialog';
import { useDocuments } from '@/hooks/useDocuments';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { groupDocumentsBySubject } from '@/lib/studyLibrary';
import type { DocumentSummary } from '@/types/document';

export function StudyLibraryPage() {
  const documents = useDocuments();
  const studyProgress = useStudyProgress();
  const [openDocument, setOpenDocument] = useState<DocumentSummary | null>(null);

  const groups = useMemo(() => groupDocumentsBySubject(documents.documents), [documents.documents]);
  const isLoading = documents.isLoading || studyProgress.isLoading;
  const error = documents.error ?? studyProgress.error;
  const progressValues = Object.values(studyProgress.progress);
  const notesReady = progressValues.filter((item) => item.noteSections > 0).length;
  const testsReady = progressValues.filter((item) => item.hasPracticeTest).length;

  const stats = [
    { label: 'Documents', value: documents.documents.length, icon: FileText },
    { label: 'Notes ready', value: notesReady, icon: BookOpen },
    { label: 'Practice tests ready', value: testsReady, icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-sky-600">Study Library</p>
        <h1 className="text-3xl font-semibold tracking-tight text-navy-900">Your study materials</h1>
        <p className="max-w-2xl text-navy-500">Every document grouped by subject, with the notes, practice tests and terms you have for it.</p>
      </header>

      {isLoading && (
        <div className="space-y-4" aria-busy="true">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-navy-100/60" />
            ))}
          </div>
          <div className="h-32 animate-pulse rounded-2xl bg-navy-100/60" />
        </div>
      )}

      {!isLoading && error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          <span>Your study library could not be loaded. {error}</span>
          <button
            type="button"
            onClick={() => {
              documents.reload();
              studyProgress.reload();
            }}
            className="font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && documents.documents.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Your library is empty"
          description="Upload a chapter from My Documents and your study materials will appear here, grouped by subject."
        />
      )}

      {!isLoading && !error && documents.documents.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-navy-500">{stat.label}</p>
                    <p className="text-2xl font-semibold text-navy-900">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.subject} aria-labelledby={`subject-${group.subject}`} className="space-y-4">
                <div className="flex items-baseline justify-between gap-4 border-b border-navy-100 pb-3">
                  <h2 id={`subject-${group.subject}`} className="text-lg font-semibold text-navy-900">
                    {group.subject}
                  </h2>
                  <span className="text-sm text-navy-500">
                    {group.documents.length} {group.documents.length === 1 ? 'document' : 'documents'}
                  </span>
                </div>
                <ul className="space-y-4">
                  {group.documents.map((doc) => (
                    <LibraryDocumentRow
                      key={doc.id}
                      document={doc}
                      progress={studyProgress.progress[doc.id] ?? { noteSections: 0, hasPracticeTest: false, savedTerms: 0 }}
                      onOpen={setOpenDocument}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      {openDocument && (
        <StudyWorkspaceDialog
          document={openDocument}
          onClose={() => {
            setOpenDocument(null);
            studyProgress.reload();
          }}
        />
      )}
    </div>
  );
}

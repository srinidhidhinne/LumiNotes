import { useMemo, useState } from 'react';
import { FolderOpen, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { StudyWorkspaceDialog } from '@/components/study/StudyWorkspaceDialog';
import { UploadDialog } from '@/components/documents/UploadDialog';
import { useDocuments } from '@/hooks/useDocuments';
import { deleteDocument } from '@/lib/documents';
import type { DocumentSummary } from '@/types/document';

export function DocumentsPage() {
  const { documents, isLoading, error, reload, addDocument, removeDocument } = useDocuments();
  const [query, setQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [openDocument, setOpenDocument] = useState<DocumentSummary | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter((doc) =>
      [doc.title, doc.subject, doc.chapter, doc.file_name]
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [documents, query]);

  const handleDelete = async (document: DocumentSummary) => {
    setActionError(null);
    try {
      await deleteDocument(document.id);
      removeDocument(document.id);
      if (openDocument?.id === document.id) setOpenDocument(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'The document could not be deleted.');
    }
  };

  const showEmpty = !isLoading && !error && documents.length === 0;
  const showNoMatches = !isLoading && !error && documents.length > 0 && filtered.length === 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-navy-900">My Documents</h1>
          <p className="mt-2 text-navy-500">Every study file you have uploaded, ready to review.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="shrink-0">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload document
        </Button>
      </header>

      {documents.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
          <TextInput
            type="search"
            aria-label="Search documents"
            placeholder="Search by title, subject or chapter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11"
          />
        </div>
      )}

      {actionError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl bg-navy-100/60" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          <span>Your documents could not be loaded. {error}</span>
          <Button variant="secondary" size="sm" onClick={reload}>
            Try again
          </Button>
        </div>
      )}

      {showEmpty && (
        <EmptyState
          icon={FolderOpen}
          title="Your library is empty"
          description="Upload a chapter or set of notes to get started. Your files stay private to your account."
          action={
            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload document
            </Button>
          }
        />
      )}

      {showNoMatches && (
        <EmptyState
          icon={Search}
          title="No matching documents"
          description={`Nothing matches "${query.trim()}". Try a different title, subject or chapter.`}
        />
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onOpen={setOpenDocument} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {isUploadOpen && <UploadDialog onClose={() => setIsUploadOpen(false)} onUploaded={addDocument} />}
      {openDocument && <StudyWorkspaceDialog document={openDocument} onClose={() => setOpenDocument(null)} />}
    </div>
  );
}

import { useState } from 'react';
import { Eye, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatBytes, formatDate } from '@/lib/format';
import type { DocumentSummary } from '@/types/document';

interface DocumentCardProps {
  document: DocumentSummary;
  onOpen: (document: DocumentSummary) => void;
  onDelete?: (document: DocumentSummary) => Promise<void>;
}

export function DocumentCard({ document, onOpen, onDelete }: DocumentCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const context = [document.subject, document.chapter].filter(Boolean).join(' / ');

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(document);
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <article className="group flex flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-navy-900" title={document.title}>
            {document.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-navy-500" title={context || document.file_name}>
            {context || document.file_name}
          </p>
        </div>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500">
        <div>
          <dt className="sr-only">File type</dt>
          <dd className="uppercase">{document.file_type}</dd>
        </div>
        <div>
          <dt className="sr-only">Size</dt>
          <dd>{formatBytes(document.file_size)}</dd>
        </div>
        <div>
          <dt className="sr-only">Uploaded</dt>
          <dd>{formatDate(document.created_at)}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-navy-100 pt-4">
        {isConfirmingDelete ? (
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-sm text-navy-700">Delete this document?</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting}>
                Keep
              </Button>
              <Button size="sm" variant="danger" onClick={() => void handleDelete()} isLoading={isDeleting}>
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => onOpen(document)}>
              <Eye className="h-4 w-4" aria-hidden="true" />
              Open
            </Button>
            {onDelete && (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                aria-label={`Delete ${document.title}`}
                className="rounded-lg p-2 text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}

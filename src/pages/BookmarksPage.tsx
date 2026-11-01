import { Bookmark, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDocuments } from '@/hooks/useDocuments';
import { formatDate } from '@/lib/format';

export function BookmarksPage() {
  const bookmarks = useBookmarks();
  const documents = useDocuments();

  const titleFor = (documentId: string) =>
    documents.documents.find((doc) => doc.id === documentId)?.title ?? 'Deleted document';

  const isLoading = bookmarks.isLoading || documents.isLoading;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-sky-600">Bookmarks</p>
        <h1 className="text-3xl font-semibold tracking-tight text-navy-900">Your saved terms</h1>
        <p className="max-w-2xl text-navy-500">Terms you saved from flashcards, kept together so you can review them anytime.</p>
      </header>

      {bookmarks.error && (
        <div role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          Your bookmarks could not be loaded. {bookmarks.error}
        </div>
      )}

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl bg-navy-100/60" />
          ))}
        </div>
      )}

      {!isLoading && !bookmarks.error && bookmarks.bookmarks.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="While practicing flashcards, select Save term to keep the terms you want to review."
        />
      )}

      {!isLoading && bookmarks.bookmarks.length > 0 && (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {bookmarks.bookmarks.map((bookmark) => (
            <li
              key={`${bookmark.documentId}-${bookmark.term}`}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">{titleFor(bookmark.documentId)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void bookmarks.remove(bookmark.documentId, bookmark.term)}
                  aria-label={`Remove ${bookmark.term} from bookmarks`}
                  className="-mr-2 -mt-2 shrink-0"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-navy-900">{bookmark.term}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-700">{bookmark.meaning}</p>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-navy-100 pt-4 text-xs text-navy-500">
                <span className="truncate">{bookmark.topic}</span>
                <span className="shrink-0">{formatDate(bookmark.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

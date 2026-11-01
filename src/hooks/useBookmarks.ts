import { useCallback, useEffect, useState } from 'react';
import { addBookmark, listBookmarks, removeBookmark } from '@/lib/bookmarks';
import type { Flashcard } from '@/lib/flashcards';
import type { Bookmark } from '@/types/bookmark';

export interface BookmarksState {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  isSaved: (documentId: string, term: string) => boolean;
  toggle: (documentId: string, card: Flashcard) => Promise<void>;
  remove: (documentId: string, term: string) => Promise<void>;
}

export function useBookmarks(): BookmarksState {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listBookmarks()
      .then((rows) => {
        if (!active) return;
        setBookmarks(rows);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Your bookmarks could not be loaded.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isSaved = useCallback(
    (documentId: string, term: string) =>
      bookmarks.some((bookmark) => bookmark.documentId === documentId && bookmark.term === term),
    [bookmarks],
  );

  const remove = useCallback(async (documentId: string, term: string) => {
    setError(null);
    try {
      await removeBookmark(documentId, term);
      setBookmarks((current) =>
        current.filter((bookmark) => !(bookmark.documentId === documentId && bookmark.term === term)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The bookmark could not be removed.');
    }
  }, []);

  const toggle = useCallback(
    async (documentId: string, card: Flashcard) => {
      if (isSaved(documentId, card.term)) {
        await remove(documentId, card.term);
        return;
      }
      setError(null);
      try {
        await addBookmark(documentId, card);
        setBookmarks((current) => [
          {
            documentId,
            term: card.term,
            meaning: card.meaning,
            topic: card.topic,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'The bookmark could not be saved.');
      }
    },
    [isSaved, remove],
  );

  return { bookmarks, isLoading, error, isSaved, toggle, remove };
}

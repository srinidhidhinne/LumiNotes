import { useCallback, useEffect, useState } from 'react';
import { listDocuments } from '@/lib/documents';
import type { DocumentSummary } from '@/types/document';

export interface DocumentsState {
  documents: DocumentSummary[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  addDocument: (document: DocumentSummary) => void;
  removeDocument: (id: string) => void;
}

export function useDocuments(): DocumentsState {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    listDocuments()
      .then((rows) => {
        if (!active) return;
        setDocuments(rows);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Your documents could not be loaded.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  const addDocument = useCallback((document: DocumentSummary) => {
    setDocuments((current) => [document, ...current]);
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments((current) => current.filter((doc) => doc.id !== id));
  }, []);

  return { documents, isLoading, error, reload, addDocument, removeDocument };
}

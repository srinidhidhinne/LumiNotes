import { useCallback, useEffect, useState } from 'react';

export type GeneratedContentStatus = 'loading' | 'idle' | 'generating' | 'ready' | 'error';

export interface GeneratedContentSource<T> {
  load: (documentId: string) => Promise<T | null>;
  generate: (documentId: string) => Promise<T>;
  loadErrorMessage: string;
  generateErrorMessage: string;
}

export interface GeneratedContentState<T> {
  content: T | null;
  status: GeneratedContentStatus;
  error: string | null;
  generate: () => Promise<void>;
}

export function useGeneratedContent<T>(documentId: string, source: GeneratedContentSource<T>): GeneratedContentState<T> {
  const [content, setContent] = useState<T | null>(null);
  const [status, setStatus] = useState<GeneratedContentStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    source
      .load(documentId)
      .then((rows) => {
        if (!active) return;
        setContent(rows);
        setStatus(rows ? 'ready' : 'idle');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : source.loadErrorMessage);
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [documentId, source]);

  const generate = useCallback(async () => {
    setStatus('generating');
    setError(null);
    try {
      setContent(await source.generate(documentId));
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : source.generateErrorMessage);
      setStatus('error');
    }
  }, [documentId, source]);

  return { content, status, error, generate };
}

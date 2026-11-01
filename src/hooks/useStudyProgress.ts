import { useCallback, useEffect, useState } from 'react';
import { loadStudyProgress, type ProgressByDocument } from '@/lib/studyLibrary';

export interface StudyProgressState {
  progress: ProgressByDocument;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useStudyProgress(): StudyProgressState {
  const [progress, setProgress] = useState<ProgressByDocument>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    loadStudyProgress()
      .then((rows) => {
        if (!active) return;
        setProgress(rows);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Your study progress could not be loaded.');
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

  return { progress, isLoading, error, reload };
}

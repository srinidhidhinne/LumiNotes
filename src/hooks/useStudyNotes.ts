import { useCallback, useEffect, useState } from 'react';
import { generateNotesSection, listStudyNoteSections } from '@/lib/studyNotes';
import type { StudyNoteSection } from '@/types/studyNotes';

type NotesStatus = 'loading' | 'idle' | 'generating' | 'ready' | 'error';

export interface StudyNotesProgress {
  done: number;
  total: number | null;
  currentLabel: string;
}

export interface StudyNotesState {
  sections: StudyNoteSection[];
  status: NotesStatus;
  progress: StudyNotesProgress | null;
  error: string | null;
  hasPartialNotes: boolean;
  generate: (restart?: boolean) => Promise<void>;
}

function mergeSection(current: StudyNoteSection[], next: StudyNoteSection): StudyNoteSection[] {
  const others = current.filter((section) => section.chunk_index !== next.chunk_index);
  return [...others, next].sort((a, b) => a.chunk_index - b.chunk_index);
}

export function useStudyNotes(documentId: string): StudyNotesState {
  const [sections, setSections] = useState<StudyNoteSection[]>([]);
  const [status, setStatus] = useState<NotesStatus>('loading');
  const [progress, setProgress] = useState<StudyNotesProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalSections, setTotalSections] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    listStudyNoteSections(documentId)
      .then((rows) => {
        if (!active) return;
        setSections(rows);
        setStatus('idle');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Your notes could not be loaded.');
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [documentId]);

  const generate = useCallback(
    async (restart = false) => {
      const startIndex = restart ? 0 : sections.length;
      setStatus('generating');
      setError(null);
      if (restart) {
        setSections([]);
        setTotalSections(null);
      }

      let index = startIndex;
      let total = restart ? null : totalSections;
      try {
        while (total === null || index < total) {
          setProgress({ done: index, total, currentLabel: '' });
          const result = await generateNotesSection(documentId, index);
          total = result.totalSections;
          setTotalSections(total);
          setSections((current) =>
            mergeSection(current, { chunk_index: result.sectionIndex, label: result.label, topics: result.topics }),
          );
          index += 1;
          setProgress({ done: index, total, currentLabel: result.label });
        }
        setProgress(null);
        setStatus('ready');
      } catch (err) {
        setProgress(null);
        setError(err instanceof Error ? err.message : 'Notes could not be generated.');
        setStatus('error');
      }
    },
    [documentId, sections.length, totalSections],
  );

  return {
    sections,
    status,
    progress,
    error,
    hasPartialNotes: sections.length > 0 && status !== 'generating',
    generate,
  };
}

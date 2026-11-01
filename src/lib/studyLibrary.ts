import { supabase } from '@/lib/supabase';
import type { DocumentSummary } from '@/types/document';

export interface DocumentProgress {
  noteSections: number;
  hasPracticeTest: boolean;
  savedTerms: number;
}

export type ProgressByDocument = Record<string, DocumentProgress>;

export interface SubjectGroup {
  subject: string;
  documents: DocumentSummary[];
}

export const GENERAL_SUBJECT = 'General';

function progressFor(map: ProgressByDocument, documentId: string): DocumentProgress {
  if (!map[documentId]) {
    map[documentId] = { noteSections: 0, hasPracticeTest: false, savedTerms: 0 };
  }
  return map[documentId];
}

export async function loadStudyProgress(): Promise<ProgressByDocument> {
  const [notes, tests, saved] = await Promise.all([
    supabase.from('study_note_sections').select('document_id'),
    supabase.from('practice_tests').select('document_id'),
    supabase.from('bookmarks').select('document_id'),
  ]);

  for (const result of [notes, tests, saved]) {
    if (result.error) throw new Error(result.error.message);
  }

  const progress: ProgressByDocument = {};
  for (const row of notes.data ?? []) progressFor(progress, String(row.document_id)).noteSections += 1;
  for (const row of tests.data ?? []) progressFor(progress, String(row.document_id)).hasPracticeTest = true;
  for (const row of saved.data ?? []) progressFor(progress, String(row.document_id)).savedTerms += 1;
  return progress;
}

export function groupDocumentsBySubject(documents: DocumentSummary[]): SubjectGroup[] {
  const groups = new Map<string, DocumentSummary[]>();
  for (const doc of documents) {
    const subject = doc.subject?.trim() || GENERAL_SUBJECT;
    groups.set(subject, [...(groups.get(subject) ?? []), doc]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      if (a === GENERAL_SUBJECT) return 1;
      if (b === GENERAL_SUBJECT) return -1;
      return a.localeCompare(b);
    })
    .map(([subject, docs]) => ({ subject, documents: docs }));
}

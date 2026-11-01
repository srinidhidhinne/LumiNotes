import { supabase } from '@/lib/supabase';
import { readFunctionError } from '@/lib/functionErrors';
import type { StudyNoteSection, StudyTopic } from '@/types/studyNotes';

export const AI_NOT_CONFIGURED = 'AI_NOT_CONFIGURED';

export interface GenerateSectionResult {
  sectionIndex: number;
  totalSections: number;
  label: string;
  topics: StudyTopic[];
}

function isStudyTopic(value: unknown): value is StudyTopic {
  if (!value || typeof value !== 'object') return false;
  const topic = value as Record<string, unknown>;
  return (
    typeof topic.heading === 'string' &&
    typeof topic.explanation === 'string' &&
    Array.isArray(topic.keyPoints) &&
    Array.isArray(topic.terms)
  );
}

function normalizeTopics(value: unknown): StudyTopic[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isStudyTopic).map((topic) => ({
    heading: topic.heading,
    explanation: topic.explanation,
    keyPoints: topic.keyPoints.filter((p): p is string => typeof p === 'string'),
    terms: topic.terms.filter(
      (t): t is { term: string; meaning: string } =>
        !!t && typeof t === 'object' && typeof (t as { term?: unknown }).term === 'string' &&
        typeof (t as { meaning?: unknown }).meaning === 'string',
    ),
    example: typeof topic.example === 'string' ? topic.example : null,
  }));
}

export async function listStudyNoteSections(documentId: string): Promise<StudyNoteSection[]> {
  const { data, error } = await supabase
    .from('study_note_sections')
    .select('chunk_index, label, topics')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    chunk_index: Number(row.chunk_index),
    label: String(row.label),
    topics: normalizeTopics(row.topics),
  }));
}

export async function generateNotesSection(documentId: string, sectionIndex: number): Promise<GenerateSectionResult> {
  const { data, error } = await supabase.functions.invoke('generate-notes', {
    body: { documentId, sectionIndex },
  });

  if (error) throw new Error(await readFunctionError(error));

  const result = data as Partial<GenerateSectionResult> | null;
  if (!result || typeof result.sectionIndex !== 'number' || typeof result.totalSections !== 'number') {
    throw new Error('Notes could not be generated for this section. Please try again.');
  }
  return {
    sectionIndex: result.sectionIndex,
    totalSections: result.totalSections,
    label: String(result.label ?? ''),
    topics: normalizeTopics(result.topics),
  };
}

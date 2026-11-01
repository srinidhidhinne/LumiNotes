import { supabase } from '@/lib/supabase';
import type { DocumentSummary, NewDocumentInput } from '@/types/document';

const SUMMARY_COLUMNS = 'id, title, subject, chapter, file_name, file_type, file_size, created_at';

export async function listDocuments(): Promise<DocumentSummary[]> {
  const { data, error } = await supabase
    .from('documents')
    .select(SUMMARY_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DocumentSummary[];
}

export async function getDocumentContent(id: string): Promise<string> {
  const { data, error } = await supabase
    .from('documents')
    .select('content')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || typeof data.content !== 'string') throw new Error('This document could not be found.');
  return data.content;
}

export async function createDocument(input: NewDocumentInput): Promise<DocumentSummary> {
  const { data, error } = await supabase
    .from('documents')
    .insert(input)
    .select(SUMMARY_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data as DocumentSummary;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

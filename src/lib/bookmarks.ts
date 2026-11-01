import { supabase } from '@/lib/supabase';
import type { Flashcard } from '@/lib/flashcards';
import type { Bookmark } from '@/types/bookmark';

function normalizeBookmarks(rows: unknown): Bookmark[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    documentId: String(row.document_id),
    term: String(row.term),
    meaning: String(row.meaning ?? ''),
    topic: String(row.topic ?? ''),
    createdAt: String(row.created_at),
  }));
}

export async function listBookmarks(): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('document_id, term, meaning, topic, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return normalizeBookmarks(data);
}

export async function addBookmark(documentId: string, card: Flashcard): Promise<void> {
  const { error } = await supabase.from('bookmarks').insert({
    document_id: documentId,
    term: card.term,
    meaning: card.meaning,
    topic: card.topic,
  });

  if (error) throw new Error(error.message);
}

export async function removeBookmark(documentId: string, term: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('document_id', documentId)
    .eq('term', term);

  if (error) throw new Error(error.message);
}

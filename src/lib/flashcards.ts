import type { StudyNoteSection } from '@/types/studyNotes';

export interface Flashcard {
  term: string;
  meaning: string;
  topic: string;
}

export function buildFlashcards(sections: StudyNoteSection[]): Flashcard[] {
  const seen = new Set<string>();
  const cards: Flashcard[] = [];

  for (const section of sections) {
    for (const topic of section.topics) {
      for (const item of topic.terms) {
        const term = item.term.trim();
        const key = term.toLowerCase();
        if (!term || seen.has(key)) continue;
        seen.add(key);
        cards.push({ term, meaning: item.meaning.trim(), topic: topic.heading });
      }
    }
  }

  return cards;
}

export function shuffleCards(cards: Flashcard[]): Flashcard[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

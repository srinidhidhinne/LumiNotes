export interface StudyTerm {
  term: string;
  meaning: string;
}

export interface StudyTopic {
  heading: string;
  explanation: string;
  keyPoints: string[];
  terms: StudyTerm[];
  example: string | null;
}

export interface StudyNoteSection {
  chunk_index: number;
  label: string;
  topics: StudyTopic[];
}

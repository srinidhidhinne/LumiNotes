export interface DocumentSummary {
  id: string;
  title: string;
  subject: string | null;
  chapter: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface NewDocumentInput {
  title: string;
  subject: string | null;
  chapter: string | null;
  learning_preferences: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  content: string;
}

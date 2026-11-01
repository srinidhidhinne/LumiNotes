import { supabase } from '@/lib/supabase';
import { readFunctionError } from '@/lib/functionErrors';
import type { SelectionAnswer } from '@/types/selectionAnswer';

export const SELECTION_AI_NOT_CONFIGURED = 'AI_NOT_CONFIGURED';

export interface AskAboutSelectionInput {
  documentId: string;
  selection: string;
  question: string;
}

export async function askAboutSelection(input: AskAboutSelectionInput): Promise<SelectionAnswer> {
  const { data, error } = await supabase.functions.invoke('ask-about-selection', { body: input });

  if (error) throw new Error(await readFunctionError(error));

  const result = data as Partial<SelectionAnswer> | null;
  if (!result || typeof result.answer !== 'string' || typeof result.foundInDocument !== 'boolean') {
    throw new Error('The answer could not be read. Please try again.');
  }
  return { answer: result.answer, foundInDocument: result.foundInDocument };
}

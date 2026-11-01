import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Briefcase, HelpCircle, Lightbulb, Loader2, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/Field';
import { askAboutSelection, SELECTION_AI_NOT_CONFIGURED } from '@/lib/selectionAnswers';
import type { SelectionAnswer } from '@/types/selectionAnswer';

interface AskAboutSelectionProps {
  documentId: string;
  quote: string;
  onBack: () => void;
}

const QUICK_QUESTIONS = [
  { text: 'Why does this happen?', icon: HelpCircle },
  { text: 'Explain with an example.', icon: Lightbulb },
  { text: 'Give me a real-world application.', icon: Briefcase },
  { text: 'What happens if this condition changes?', icon: Shuffle },
];

type ExchangeState =
  | { status: 'pending' }
  | { status: 'done'; answer: SelectionAnswer }
  | { status: 'error'; message: string };

interface Exchange {
  id: number;
  question: string;
  state: ExchangeState;
}

function describeError(message: string): string {
  if (message === SELECTION_AI_NOT_CONFIGURED) {
    return 'AI answers are not switched on for this project yet.';
  }
  return message;
}

export function AskAboutSelection({ documentId, quote, onBack }: AskAboutSelectionProps) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [draft, setDraft] = useState('');
  const nextId = useRef(0);
  const isBusy = exchanges.some((exchange) => exchange.state.status === 'pending');

  const updateExchange = (id: number, state: ExchangeState) => {
    setExchanges((current) => current.map((exchange) => (exchange.id === id ? { ...exchange, state } : exchange)));
  };

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isBusy) return;

    const id = nextId.current++;
    setExchanges((current) => [...current, { id, question: trimmed, state: { status: 'pending' } }]);
    setDraft('');

    try {
      const answer = await askAboutSelection({ documentId, selection: quote, question: trimmed });
      updateExchange(id, { status: 'done', answer });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'The answer could not be generated. Please try again.';
      updateExchange(id, { status: 'error', message: describeError(message) });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(draft);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_200ms_ease-out]">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to study material
      </Button>

      <section aria-label="Selected text" className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Selected text</p>
        <blockquote className="max-h-40 overflow-y-auto whitespace-pre-line rounded-2xl border-l-4 border-plum-400 bg-lavender-100 px-5 py-4 text-sm leading-relaxed text-navy-800">
          {quote}
        </blockquote>
      </section>

      <section aria-label="Quick questions" className="grid gap-3 sm:grid-cols-2">
        {QUICK_QUESTIONS.map(({ text, icon: Icon }) => (
          <button
            key={text}
            type="button"
            disabled={isBusy}
            onClick={() => void ask(text)}
            className="flex items-center gap-3 rounded-2xl border border-navy-200 bg-white px-4 py-3 text-left text-sm font-medium text-navy-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-plum-300 hover:bg-lavender-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Icon className="h-4 w-4 shrink-0 text-plum-700" aria-hidden="true" />
            {text}
          </button>
        ))}
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Ask your own question" htmlFor="selection-question">
            <TextInput
              id="selection-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="For example: how is this used in practice?"
              maxLength={300}
            />
          </Field>
        </div>
        <Button type="submit" disabled={!draft.trim() || isBusy} className="sm:mb-px">
          Ask
        </Button>
      </form>

      <section aria-label="Answers" aria-live="polite" className="space-y-5">
        {exchanges.map((exchange) => (
          <div key={exchange.id} className="space-y-3">
            <p className="text-sm font-semibold text-navy-900">{exchange.question}</p>
            <AnswerBody state={exchange.state} />
          </div>
        ))}
      </section>
    </div>
  );
}

function AnswerBody({ state }: { state: ExchangeState }) {
  if (state.status === 'pending') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-5 py-4 text-sm text-navy-600 shadow-card">
        <Loader2 className="h-4 w-4 animate-spin text-plum-700" aria-hidden="true" />
        Reading the selected text and your document...
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <p role="alert" className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
        {state.message}
      </p>
    );
  }

  const { answer, foundInDocument } = state.answer;
  return (
    <div className="space-y-3 rounded-2xl border border-navy-100 bg-white px-5 py-5 shadow-card">
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          foundInDocument ? 'bg-sage-200 text-sage-900' : 'bg-blush-200 text-blush-900'
        }`}
      >
        {foundInDocument ? 'From your document' : 'Not covered in your document'}
      </span>
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-navy-800">{answer}</p>
    </div>
  );
}

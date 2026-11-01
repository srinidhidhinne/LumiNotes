import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import type { TextSelection } from '@/hooks/useTextSelection';

interface AskSelectionButtonProps {
  selection: TextSelection;
  onAsk: (text: string) => void;
}

const EDGE_CLEARANCE = 64;

export function AskSelectionButton({ selection, onAsk }: AskSelectionButtonProps) {
  const { rect, text } = selection;
  const placeAbove = rect.top > EDGE_CLEARANCE;
  const top = placeAbove ? rect.top - 12 : rect.bottom + 12;
  const left = rect.left + rect.width / 2;

  return createPortal(
    <button
      type="button"
      onPointerDown={(event) => {
        event.preventDefault();
        onAsk(text);
      }}
      onClick={(event) => {
        if (event.detail === 0) onAsk(text);
      }}
      style={{ top, left }}
      className={`fixed z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-plum-700 px-4 py-2 text-sm font-semibold text-white shadow-lift transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500 focus-visible:ring-offset-2 animate-[fadeIn_150ms_ease-out] ${
        placeAbove ? '-translate-y-full' : ''
      }`}
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      Ask AI
    </button>,
    document.body,
  );
}

import { useEffect, useState, type RefObject } from 'react';

const MAX_SELECTION_CHARS = 2000;

export interface TextSelection {
  text: string;
  rect: DOMRect;
}

export function useTextSelection(containerRef: RefObject<HTMLElement | null>): TextSelection | null {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  useEffect(() => {
    const update = () => {
      const domSelection = window.getSelection();
      const container = containerRef.current;
      const text = domSelection?.toString().trim() ?? '';
      if (
        !domSelection ||
        !container ||
        domSelection.rangeCount === 0 ||
        !text ||
        !domSelection.anchorNode ||
        !domSelection.focusNode ||
        !container.contains(domSelection.anchorNode) ||
        !container.contains(domSelection.focusNode)
      ) {
        setSelection(null);
        return;
      }
      setSelection({
        text: text.slice(0, MAX_SELECTION_CHARS),
        rect: domSelection.getRangeAt(0).getBoundingClientRect(),
      });
    };

    document.addEventListener('selectionchange', update);
    document.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      document.removeEventListener('selectionchange', update);
      document.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [containerRef]);

  return selection;
}

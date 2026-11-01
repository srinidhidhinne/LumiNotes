import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  isDismissible?: boolean;
  maxWidthClass?: string;
  children: ReactNode;
}

export function Modal({
  title,
  description,
  onClose,
  isDismissible = true,
  maxWidthClass = 'max-w-lg',
  children,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDismissible) onClose();
    };
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isDismissible, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 animate-[fadeIn_150ms_ease-out] bg-navy-950/40 backdrop-blur-sm"
        onClick={isDismissible ? onClose : undefined}
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[90vh] w-full ${maxWidthClass} animate-[slideUp_200ms_ease-out] flex-col rounded-t-2xl bg-white shadow-lift sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-navy-100 px-6 py-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-navy-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-navy-500">{description}</p>}
          </div>
          {isDismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-700"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

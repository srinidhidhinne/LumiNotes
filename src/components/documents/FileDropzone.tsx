import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, validateUploadFile } from '@/lib/documentText';
import { formatBytes } from '@/lib/format';

interface FileDropzoneProps {
  file: File | null;
  error: string | null;
  disabled: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export function FileDropzone({ file, error, disabled, onFileSelect, onClear }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return;
    const validationError = validateUploadFile(candidate);
    setLocalError(validationError);
    if (!validationError) onFileSelect(candidate);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    acceptFile(event.dataTransfer.files[0]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const shownError = localError ?? error;

  if (file) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy-900">{file.name}</p>
          <p className="text-xs text-navy-500">{formatBytes(file.size)}</p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove selected file"
            className="rounded-lg p-2 text-navy-400 transition-colors hover:bg-white hover:text-navy-700"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
          isDragging
            ? 'border-sky-500 bg-sky-50'
            : 'border-navy-200 bg-white hover:border-sky-400 hover:bg-sky-50/40'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-200 ${
            isDragging ? 'bg-sky-500 text-white' : 'bg-navy-100 text-navy-700'
          }`}
        >
          <Upload className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-medium text-navy-900">
          Drag and drop your file here, or <span className="text-sky-600 underline-offset-2 hover:underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-navy-500">PDF, PPTX or TXT files up to 20 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            acceptFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
      {shownError && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {shownError}
        </p>
      )}
    </div>
  );
}

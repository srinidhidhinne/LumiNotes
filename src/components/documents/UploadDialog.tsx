import { useState, type FormEvent } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, TextArea, TextInput } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { FileDropzone } from '@/components/documents/FileDropzone';
import { ProcessingReport } from '@/components/documents/ProcessingReport';
import { createDocument } from '@/lib/documents';
import { extractTextFromFile, getFileExtension, getFileTitle, type ExtractedText } from '@/lib/documentText';
import type { DocumentSummary } from '@/types/document';

type UploadStage = 'idle' | 'reading' | 'saving' | 'complete';

interface UploadDialogProps {
  onClose: () => void;
  onUploaded: (document: DocumentSummary) => void;
}

const steps: { stage: Exclude<UploadStage, 'idle'>; label: string }[] = [
  { stage: 'reading', label: 'Reading and extracting text' },
  { stage: 'saving', label: 'Saving to your library' },
];

const stageOrder: UploadStage[] = ['idle', 'reading', 'saving', 'complete'];

export function UploadDialog({ onClose, onUploaded }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [preferences, setPreferences] = useState('');
  const [stage, setStage] = useState<UploadStage>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [report, setReport] = useState<ExtractedText | null>(null);

  const isBusy = stage === 'reading' || stage === 'saving';
  const isComplete = stage === 'complete';

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setFileError(null);
    setSubmitError(null);
    if (!title.trim()) setTitle(getFileTitle(selected.name));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy || isComplete) return;

    if (!file) {
      setFileError('Choose a file to upload.');
      return;
    }
    if (!title.trim()) {
      setSubmitError('Please give this document a title.');
      return;
    }

    setSubmitError(null);
    setStage('reading');
    try {
      const extracted = await extractTextFromFile(file);

      setStage('saving');
      const saved = await createDocument({
        title: title.trim(),
        subject: subject.trim() || null,
        chapter: chapter.trim() || null,
        learning_preferences: preferences.trim() || null,
        file_name: file.name,
        file_type: getFileExtension(file.name),
        file_size: file.size,
        content: extracted.content,
      });

      setReport(extracted);
      setStage('complete');
      onUploaded(saved);
    } catch (err) {
      setStage('idle');
      setSubmitError(err instanceof Error ? err.message : 'The upload failed. Please try again.');
    }
  };

  const currentStepIndex = stageOrder.indexOf(stage);

  return (
    <Modal
      title="Upload study material"
      description="Add a document and tell LumiNotes what it covers."
      onClose={onClose}
      isDismissible={!isBusy}
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {isComplete && report ? (
          <ProcessingReport {...report} />
        ) : (
          <>
            <FileDropzone
              file={file}
              error={fileError}
              disabled={isBusy}
              onFileSelect={handleFileSelect}
              onClear={() => setFile(null)}
            />

            <Field label="Document title" htmlFor="upload-title">
              <TextInput
                id="upload-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Operating Systems - Chapter 2"
                disabled={isBusy}
                maxLength={150}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Subject" htmlFor="upload-subject">
                <TextInput
                  id="upload-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  disabled={isBusy}
                  maxLength={100}
                />
              </Field>
              <Field label="Chapter" htmlFor="upload-chapter">
                <TextInput
                  id="upload-chapter"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="e.g. Processes"
                  disabled={isBusy}
                  maxLength={100}
                />
              </Field>
            </div>

            <Field
              label="Learning preferences"
              htmlFor="upload-preferences"
              hint="Optional. For example: simple language, exam-focused, or more examples."
            >
              <TextArea
                id="upload-preferences"
                rows={3}
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                disabled={isBusy}
                maxLength={500}
              />
            </Field>

            {(isBusy || submitError) && (
              <div className="space-y-3 rounded-2xl bg-navy-50 p-4">
                {isBusy && (
                  <ul className="space-y-2" aria-live="polite">
                    {steps.map((step) => {
                      const stepIndex = stageOrder.indexOf(step.stage);
                      const isDone = currentStepIndex > stepIndex;
                      const isActive = currentStepIndex === stepIndex;
                      return (
                        <li key={step.stage} className="flex items-center gap-3 text-sm">
                          {isDone && <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
                          {isActive && <Loader2 className="h-4 w-4 animate-spin text-sky-600" aria-hidden="true" />}
                          {!isDone && !isActive && <Circle className="h-4 w-4 text-navy-300" aria-hidden="true" />}
                          <span className={isActive ? 'font-medium text-navy-900' : 'text-navy-600'}>
                            {step.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {submitError && (
                  <p role="alert" className="text-sm text-red-700">
                    {submitError}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isBusy}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isBusy}>
                Upload and save
              </Button>
            </div>
          </>
        )}

        {isComplete && (
          <div className="flex justify-end">
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
}

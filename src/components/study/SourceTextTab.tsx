import { useEffect, useState } from 'react';
import { Check, Copy, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getDocumentContent } from '@/lib/documents';
import { formatNumber } from '@/lib/format';
import type { DocumentSummary } from '@/types/document';

interface SourceTextTabProps {
  document: DocumentSummary;
}

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; content: string };

export function SourceTextTab({ document }: SourceTextTabProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [copied, setCopied] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getDocumentContent(document.id)
      .then((content) => {
        if (active) setState({ status: 'ready', content });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'The text could not be loaded.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [document.id, reloadKey]);

  const handleCopy = async () => {
    if (state.status !== 'ready') return;
    try {
      await navigator.clipboard.writeText(state.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (state.status !== 'ready') return;
    const blob = new Blob([state.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy-500">
          {state.status === 'ready'
            ? `${formatNumber(state.content.split(/\s+/).filter(Boolean).length)} words extracted from your file`
            : 'The text extracted from your file'}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => void handleCopy()} disabled={state.status !== 'ready'}>
            {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy text'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownload} disabled={state.status !== 'ready'}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download .txt
          </Button>
        </div>
      </div>

      {state.status === 'loading' && (
        <div className="flex items-center gap-3 rounded-2xl bg-navy-50 p-6 text-sm text-navy-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading text...
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          <span>{state.message}</span>
          <Button variant="secondary" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </Button>
        </div>
      )}

      {state.status === 'ready' && (
        <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-navy-100 bg-white p-5 font-sans text-sm leading-relaxed text-navy-800">
          {state.content}
        </pre>
      )}
    </div>
  );
}

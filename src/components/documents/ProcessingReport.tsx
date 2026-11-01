import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ExtractedText } from '@/lib/documentText';
import { formatNumber } from '@/lib/format';

const stats: { key: 'wordCount' | 'lineCount' | 'characterCount'; label: string }[] = [
  { key: 'wordCount', label: 'Words' },
  { key: 'lineCount', label: 'Lines' },
  { key: 'characterCount', label: 'Characters' },
];

export function ProcessingReport(report: ExtractedText) {
  const hasUnreadable = report.unreadableSections.length > 0;
  const sectionLabel = report.sectionKind === 'Slide' ? 'slides' : 'pages';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <p className="font-medium">Document saved and ready to study</p>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-4 text-center">
          {stats.map((stat) => (
            <div key={stat.key}>
              <dt className="text-xs text-navy-500">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-navy-900">{formatNumber(report[stat.key])}</dd>
            </div>
          ))}
        </dl>
        {report.sectionKind && (
          <p className="mt-4 text-sm text-navy-700">
            Read {report.readSections} of {report.totalSections} {sectionLabel}.
          </p>
        )}
        {!report.sectionKind && (
          <p className="mt-4 text-xs text-navy-600">Plain text files have no pages, so every line was read.</p>
        )}
      </div>

      {hasUnreadable && (
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <p className="font-medium">Some {sectionLabel} had no readable text</p>
          </div>
          <p className="mt-2 text-sm text-amber-900">
            {report.unreadableSections.join(', ')}. These are often scanned images, which are not read yet. Their content is not included in your notes.
          </p>
        </div>
      )}
    </div>
  );
}

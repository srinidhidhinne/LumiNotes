import type { DocumentSummary } from '@/types/document';

interface DocumentSelectProps {
  documents: DocumentSummary[];
  value: string;
  onChange: (documentId: string) => void;
}

export function DocumentSelect({ documents, value, onChange }: DocumentSelectProps) {
  return (
    <label className="block max-w-md space-y-2">
      <span className="text-sm font-medium text-navy-700">Document</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 transition-colors duration-200 focus:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.title}
          </option>
        ))}
      </select>
    </label>
  );
}

import { useMemo, useState } from 'react';
import { AlertTriangle, GitBranch, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { DiagramView } from '@/components/study/DiagramView';
import { useGeneratedContent, type GeneratedContentSource } from '@/hooks/useGeneratedContent';
import { diagramGroups } from '@/lib/diagramLayout';
import { generateDiagram, getDiagram } from '@/lib/diagrams';
import { toneFor } from '@/lib/topicTones';
import type { ConceptDiagram } from '@/types/diagram';

const DIAGRAM_SOURCE: GeneratedContentSource<ConceptDiagram> = {
  load: getDiagram,
  generate: generateDiagram,
  loadErrorMessage: 'Your diagram could not be loaded.',
  generateErrorMessage: 'The diagram could not be generated.',
};

interface DiagramTabProps {
  documentId: string;
}

export function DiagramTab({ documentId }: DiagramTabProps) {
  const diagram = useGeneratedContent(documentId, DIAGRAM_SOURCE);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (diagram.status === 'loading') {
    return <div className="h-72 animate-pulse rounded-2xl bg-navy-100/60" aria-busy="true" />;
  }

  if (diagram.status === 'generating') {
    return (
      <div className="rounded-2xl border border-sky-100 bg-sky-50 p-8 text-center" role="status">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-sky-700" aria-hidden="true" />
        <p className="mt-4 font-medium text-navy-800">Drawing your concept diagram...</p>
        <p className="mt-1 text-sm text-navy-500">This usually takes under a minute.</p>
      </div>
    );
  }

  if (diagram.status === 'error') {
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{diagram.error}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void diagram.generate()} className="shrink-0">
          Try again
        </Button>
      </div>
    );
  }

  if (!diagram.content) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No diagram yet"
        description="Turn this document into a visual diagram that shows how its main ideas connect."
        action={
          <Button onClick={() => void diagram.generate()}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Create diagram
          </Button>
        }
      />
    );
  }

  return (
    <DiagramReady
      diagram={diagram.content}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onRegenerate={() => void diagram.generate()}
    />
  );
}

interface DiagramReadyProps {
  diagram: ConceptDiagram;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRegenerate: () => void;
}

function DiagramReady({ diagram, selectedId, onSelect, onRegenerate }: DiagramReadyProps) {
  const groups = useMemo(() => diagramGroups(diagram), [diagram]);
  const selected = diagram.nodes.find((node) => node.id === selectedId) ?? diagram.nodes[0];
  const selectedTone = toneFor(groups.indexOf(selected.group));
  const outgoing = diagram.edges.filter((edge) => edge.from === selected.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-navy-900">{diagram.title}</h3>
          <p className="text-sm text-navy-500">Select any box to read how it fits in.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onRegenerate}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Regenerate
        </Button>
      </div>

      <DiagramView diagram={diagram} selectedId={selected.id} onSelect={onSelect} />

      <section
        aria-live="polite"
        className={`rounded-2xl border p-6 shadow-card transition-colors duration-300 ${selectedTone.border} ${selectedTone.soft}`}
      >
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${selectedTone.chip}`}>
          {selected.group}
        </span>
        <h4 className="mt-3 text-xl font-semibold text-navy-900">{selected.label}</h4>
        <p className="mt-2 leading-relaxed text-navy-700">{selected.detail}</p>
        {outgoing.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-navy-700">
            {outgoing.map((edge) => {
              const target = diagram.nodes.find((node) => node.id === edge.to);
              return (
                <li key={`${edge.from}-${edge.to}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(edge.to)}
                    className="font-medium text-navy-900 underline-offset-4 hover:underline"
                  >
                    {target?.label}
                  </button>
                  {edge.label && <span className="text-navy-500"> ({edge.label})</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

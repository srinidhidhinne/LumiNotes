import { useMemo } from 'react';
import { NODE_HEIGHT, NODE_WIDTH, diagramGroups, layoutDiagram } from '@/lib/diagramLayout';
import { toneFor } from '@/lib/topicTones';
import type { ConceptDiagram } from '@/types/diagram';

interface DiagramViewProps {
  diagram: ConceptDiagram;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ARROW_ID = 'concept-diagram-arrow';

export function DiagramView({ diagram, selectedId, onSelect }: DiagramViewProps) {
  const layout = useMemo(() => layoutDiagram(diagram), [diagram]);

  const groups = useMemo(() => diagramGroups(diagram), [diagram]);

  const toneForGroup = (group: string) => toneFor(groups.indexOf(group));

  return (
    <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
      <div className="relative mx-auto" style={{ width: layout.width, height: layout.height }}>
        <svg
          className="absolute inset-0 overflow-visible"
          width={layout.width}
          height={layout.height}
          aria-hidden="true"
        >
          <defs>
            <marker id={ARROW_ID} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#70558F" />
            </marker>
          </defs>
          {diagram.edges.map((edge, index) => {
            const from = layout.positions.get(edge.from);
            const to = layout.positions.get(edge.to);
            if (!from || !to) return null;
            const x1 = from.x + NODE_WIDTH;
            const y1 = from.y + NODE_HEIGHT / 2;
            const x2 = to.x;
            const y2 = to.y + NODE_HEIGHT / 2;
            const curve = (x2 - x1) / 2;
            return (
              <path
                key={index}
                d={`M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="#70558F"
                strokeWidth={2}
                markerEnd={`url(#${ARROW_ID})`}
              />
            );
          })}
        </svg>

        {diagram.edges.map((edge, index) => {
          if (!edge.label) return null;
          const from = layout.positions.get(edge.from);
          const to = layout.positions.get(edge.to);
          if (!from || !to) return null;
          const midX = (from.x + NODE_WIDTH + to.x) / 2;
          const midY = (from.y + to.y + NODE_HEIGHT) / 2;
          return (
            <span
              key={index}
              style={{ left: midX, top: midY }}
              className="pointer-events-none absolute w-[128px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-navy-200 bg-white px-3 py-1 text-center text-[11px] font-medium leading-tight text-navy-700 shadow-sm"
            >
              {edge.label}
            </span>
          );
        })}

        {diagram.nodes.map((node) => {
          const position = layout.positions.get(node.id);
          if (!position) return null;
          const tone = toneForGroup(node.group);
          const isSelected = node.id === selectedId;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelect(node.id)}
              aria-pressed={isSelected}
              style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
              className={`absolute flex flex-col justify-between rounded-2xl border p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${tone.border} ${tone.soft} ${
                isSelected ? 'ring-2 ring-navy-900 ring-offset-2' : ''
              }`}
            >
              <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tone.chip}`}>
                {node.group}
              </span>
              <span className="line-clamp-2 text-sm font-semibold leading-snug text-navy-900">{node.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

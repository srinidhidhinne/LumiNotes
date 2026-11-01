import type { ConceptDiagram } from '@/types/diagram';

export const NODE_WIDTH = 224;
export const NODE_HEIGHT = 104;
const COLUMN_GAP = 160;
const ROW_GAP = 28;

export interface DiagramPosition {
  x: number;
  y: number;
}

export interface DiagramLayout {
  positions: Map<string, DiagramPosition>;
  width: number;
  height: number;
}

function columnsFor(diagram: ConceptDiagram): Map<string, number> {
  const column = new Map(diagram.nodes.map((node) => [node.id, 0]));
  for (let pass = 0; pass < diagram.nodes.length; pass++) {
    let changed = false;
    for (const edge of diagram.edges) {
      const next = (column.get(edge.from) ?? 0) + 1;
      if (next > (column.get(edge.to) ?? 0) && next < diagram.nodes.length) {
        column.set(edge.to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return column;
}

export function diagramGroups(diagram: ConceptDiagram): string[] {
  const names: string[] = [];
  for (const node of diagram.nodes) {
    if (!names.includes(node.group)) names.push(node.group);
  }
  return names;
}

export function layoutDiagram(diagram: ConceptDiagram): DiagramLayout {
  const column = columnsFor(diagram);
  const columnCount = Math.max(...column.values()) + 1;
  const rows: string[][] = Array.from({ length: columnCount }, () => []);
  for (const node of diagram.nodes) {
    rows[column.get(node.id) ?? 0].push(node.id);
  }

  const tallest = Math.max(...rows.map((items) => items.length));
  const height = tallest * NODE_HEIGHT + (tallest - 1) * ROW_GAP;
  const positions = new Map<string, DiagramPosition>();

  rows.forEach((items, columnIndex) => {
    const columnHeight = items.length * NODE_HEIGHT + (items.length - 1) * ROW_GAP;
    const top = (height - columnHeight) / 2;
    items.forEach((id, row) => {
      positions.set(id, {
        x: columnIndex * (NODE_WIDTH + COLUMN_GAP),
        y: top + row * (NODE_HEIGHT + ROW_GAP),
      });
    });
  });

  return {
    positions,
    width: columnCount * NODE_WIDTH + (columnCount - 1) * COLUMN_GAP,
    height,
  };
}

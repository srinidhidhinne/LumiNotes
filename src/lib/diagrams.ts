import { supabase } from '@/lib/supabase';
import { readFunctionError } from '@/lib/functionErrors';
import type { ConceptDiagram, DiagramEdge, DiagramNode } from '@/types/diagram';

const MAX_NODES = 14;

function normalizeDiagram(value: unknown): ConceptDiagram | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.title !== 'string' || !Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) return null;

  const nodes: DiagramNode[] = [];
  const ids = new Set<string>();
  for (const item of raw.nodes) {
    if (!item || typeof item !== 'object') continue;
    const node = item as Record<string, unknown>;
    if (
      typeof node.id !== 'string' || typeof node.label !== 'string' ||
      typeof node.detail !== 'string' || typeof node.group !== 'string'
    ) {
      continue;
    }
    if (ids.has(node.id) || nodes.length >= MAX_NODES) continue;
    ids.add(node.id);
    nodes.push({ id: node.id, label: node.label, detail: node.detail, group: node.group || 'General' });
  }

  const edges: DiagramEdge[] = [];
  for (const item of raw.edges) {
    if (!item || typeof item !== 'object') continue;
    const edge = item as Record<string, unknown>;
    if (typeof edge.from !== 'string' || typeof edge.to !== 'string' || typeof edge.label !== 'string') continue;
    if (edge.from === edge.to || !ids.has(edge.from) || !ids.has(edge.to)) continue;
    edges.push({ from: edge.from, to: edge.to, label: edge.label });
  }

  return nodes.length >= 2 ? { title: raw.title, nodes, edges } : null;
}

export async function getDiagram(documentId: string): Promise<ConceptDiagram | null> {
  const { data, error } = await supabase
    .from('study_diagrams')
    .select('diagram')
    .eq('document_id', documentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return normalizeDiagram(data.diagram);
}

export async function generateDiagram(documentId: string): Promise<ConceptDiagram> {
  const { data, error } = await supabase.functions.invoke('generate-diagram', {
    body: { documentId },
  });

  if (error) throw new Error(await readFunctionError(error));

  const diagram = normalizeDiagram((data as { diagram?: unknown } | null)?.diagram);
  if (!diagram) {
    throw new Error('The diagram could not be generated. Please try again.');
  }
  return diagram;
}

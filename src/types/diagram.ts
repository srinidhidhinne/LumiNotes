export interface DiagramNode {
  id: string;
  label: string;
  detail: string;
  group: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label: string;
}

export interface ConceptDiagram {
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

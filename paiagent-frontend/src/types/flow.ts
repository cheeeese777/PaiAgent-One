export interface FlowDefinition {
  id?: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface NodeData extends Record<string, unknown> {
  label: string;
  nodeKey: string;
  // LLM-specific
  provider?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  // Tool-specific
  toolType?: string;
  toolConfig?: Record<string, unknown>;
  // Output-specific
  outputMappings?: OutputMapping[];
  responseTemplate?: string;
}

export interface OutputMapping {
  name: string;
  mode: 'reference' | 'static';
  value: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

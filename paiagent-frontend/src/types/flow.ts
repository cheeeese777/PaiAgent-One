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
  // Input-specific
  inputVariableName?: string;
  inputVariableType?: string;
  inputDescription?: string;
  inputRequired?: boolean;
  // LLM-specific
  provider?: string;
  model?: string;
  apiUrl?: string;
  apiKey?: string;
  systemPrompt?: string;
  userPrompt?: string;
  inputParameters?: InputParameter[];
  outputParameters?: OutputParameter[];
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
  parameterType: 'input' | 'reference';
  mode: 'reference' | 'static';
  value: string;
}

export interface InputParameter {
  name: string;
  parameterType: 'input' | 'reference';
  value: string;
}

export interface OutputParameter {
  name: string;
  type: string;
  description?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

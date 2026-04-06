export interface NodeDefinition {
  id: number;
  nodeKey: string;
  nodeType: string;
  label: string;
  category: string;
  iconUrl: string;
  configSchema: string;
  defaultConfig: string;
}

export interface NodeCategory {
  category: string;
  nodes: NodeDefinition[];
}

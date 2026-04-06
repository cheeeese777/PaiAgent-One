import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { NodeData } from '../types/flow';

interface FlowState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  flowId: number | null;
  flowName: string;
  selectedNodeId: string | null;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setSelectedNode: (nodeId: string | null) => void;

  addNode: (node: Node<NodeData>) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;

  setFlowId: (id: number | null) => void;
  setFlowName: (name: string) => void;
  loadFlow: (id: number | null, name: string, nodes: Node<NodeData>[], edges: Edge[]) => void;
  resetFlow: () => void;

  getFlowJson: () => string;
}

const defaultNodes: Node<NodeData>[] = [
  {
    id: 'input-default',
    type: 'input',
    position: { x: 250, y: 50 },
    data: { label: '输入', nodeKey: 'input' },
  },
  {
    id: 'output-default',
    type: 'output',
    position: { x: 250, y: 400 },
    data: {
      label: '输出',
      nodeKey: 'output',
      outputMappings: [{ name: 'output', mode: 'reference', value: '' }],
      responseTemplate: '{{output}}',
    },
  },
];

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [...defaultNodes],
  edges: [],
  flowId: null,
  flowName: '未命名工作流',
  selectedNodeId: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, id: `e-${Date.now()}` }, get().edges) });
  },

  setSelectedNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  setFlowId: (id) => set({ flowId: id }),
  setFlowName: (name) => set({ flowName: name }),

  loadFlow: (id, name, nodes, edges) => {
    set({ flowId: id, flowName: name, nodes, edges, selectedNodeId: null });
  },

  resetFlow: () => {
    set({
      nodes: [...defaultNodes],
      edges: [],
      flowId: null,
      flowName: '未命名工作流',
      selectedNodeId: null,
    });
  },

  getFlowJson: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges });
  },
}));

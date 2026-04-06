import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type ReactFlowInstance,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '../../store/useFlowStore';
import { useExecutionStore } from '../../store/useExecutionStore';
import type { NodeData } from '../../types/flow';
import type { NodeDefinition } from '../../types/node';
import InputNode from './nodes/InputNode';
import LLMNode from './nodes/LLMNode';
import ToolNode from './nodes/ToolNode';
import OutputNode from './nodes/OutputNode';

const nodeTypes = {
  input: InputNode,
  llm: LLMNode,
  tool: ToolNode,
  output: OutputNode,
};

export default function FlowCanvas() {
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance<Node<NodeData>> | null>(null);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode, addNode } = useFlowStore();
  const nodeStatuses = useExecutionStore((s) => s.nodeStatuses);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/paiagent-node');
      if (!rawData || !rfInstance.current) return;

      const nodeDef: NodeDefinition = JSON.parse(rawData);
      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeType = nodeDef.nodeType.toLowerCase() === 'llm' ? 'llm' : 'tool';
      const defaultConfig = nodeDef.defaultConfig ? JSON.parse(nodeDef.defaultConfig) : {};

      const newNode: Node<NodeData> = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label: nodeDef.label,
          nodeKey: nodeDef.nodeKey,
          ...defaultConfig,
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Apply execution status as class names to nodes
  const styledNodes = nodes.map((node) => {
    const status = nodeStatuses[node.id];
    let className = '';
    if (status === 'running') className = 'ring-2 ring-blue-400 ring-offset-2 animate-pulse';
    else if (status === 'done') className = 'ring-2 ring-green-400 ring-offset-2';
    else if (status === 'error') className = 'ring-2 ring-red-400 ring-offset-2';
    return { ...node, className };
  });

  return (
    <div ref={reactFlowRef} className="w-full h-full bg-gray-50">
      <ReactFlow<Node<NodeData>>
        nodes={styledNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={(instance) => { rfInstance.current = instance; }}
        fitView
        deleteKeyCode="Delete"
        className="bg-gray-50"
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls className="bg-white shadow-md rounded-lg" />
        <MiniMap
          className="bg-white shadow-md rounded-lg"
          nodeColor={(node) => {
            switch (node.type) {
              case 'input': return '#818cf8';
              case 'llm': return '#60a5fa';
              case 'tool': return '#f59e0b';
              case 'output': return '#34d399';
              default: return '#94a3b8';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

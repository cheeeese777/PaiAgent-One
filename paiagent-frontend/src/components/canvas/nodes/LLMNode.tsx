import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../../../types/flow';

const providerIcons: Record<string, string> = {
  deepseek: '🐙',
  qwen: '🌟',
  aiping: '🏓',
  zhipu: '🧿',
};

export default function LLMNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const icon = providerIcons[nodeData.provider || nodeData.nodeKey] || '🤖';

  return (
    <div
      className={`px-6 py-3 bg-white rounded-xl border-2 shadow-sm min-w-[160px] text-center transition-all
        ${selected ? 'border-blue-500 shadow-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{nodeData.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white" />
    </div>
  );
}

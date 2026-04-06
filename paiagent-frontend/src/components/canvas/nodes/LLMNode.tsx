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
      className={`relative px-5 py-3 bg-gradient-to-br from-white to-purple-50 rounded-lg border-2 shadow-sm min-w-[140px] text-center transition-all duration-200
        ${selected ? 'border-purple-500 shadow-lg shadow-purple-200 scale-105' : 'border-gray-200 hover:border-purple-300 hover:shadow-md'}`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white !shadow-sm" 
        style={{ top: '-6px' }}
      />
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg drop-shadow-sm">{icon}</span>
        <span className="text-sm font-semibold text-gray-800">{nodeData.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white !shadow-sm" 
        style={{ bottom: '-6px' }}
      />
    </div>
  );
}

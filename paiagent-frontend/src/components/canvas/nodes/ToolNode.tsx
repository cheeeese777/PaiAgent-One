import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../../../types/flow';

const toolIcons: Record<string, string> = {
  voice_synthesis: '🎙️',
};

export default function ToolNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const icon = toolIcons[nodeData.toolType || nodeData.nodeKey] || '🔧';

  return (
    <div
      className={`relative px-5 py-3 bg-gradient-to-br from-white to-amber-50 rounded-lg border-2 shadow-sm min-w-[140px] text-center transition-all duration-200
        ${selected ? 'border-amber-500 shadow-lg shadow-amber-200 scale-105' : 'border-gray-200 hover:border-amber-300 hover:shadow-md'}`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white !shadow-sm" 
        style={{ top: '-6px' }}
      />
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg drop-shadow-sm">{icon}</span>
        <span className="text-sm font-semibold text-gray-800">{nodeData.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white !shadow-sm" 
        style={{ bottom: '-6px' }}
      />
    </div>
  );
}

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../../../types/flow';

export default function OutputNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  return (
    <div
      className={`relative px-5 py-3 bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm min-w-[140px] text-center transition-all duration-200
        ${selected ? 'shadow-lg shadow-green-200 scale-105 ring-2 ring-green-500' : 'hover:shadow-md'}`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-white !shadow-sm" 
        style={{ top: '-6px' }}
      />
      <div className="flex items-center justify-center gap-2">
        <span className="text-green-600 text-lg drop-shadow-sm">📤</span>
        <span className="text-sm font-semibold text-gray-800">{nodeData.label}</span>
      </div>
    </div>
  );
}

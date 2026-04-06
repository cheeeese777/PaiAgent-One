import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeData } from '../../../types/flow';

export default function OutputNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  return (
    <div
      className={`px-6 py-3 bg-white rounded-xl border-2 shadow-sm min-w-[160px] text-center transition-all
        ${selected ? 'border-blue-500 shadow-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-green-400 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center justify-center gap-2">
        <span className="text-green-500 text-base">📤</span>
        <span className="text-sm font-medium text-gray-700">{nodeData.label}</span>
      </div>
    </div>
  );
}

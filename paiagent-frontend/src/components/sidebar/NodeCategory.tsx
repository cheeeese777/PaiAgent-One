import { useState } from 'react';
import type { NodeCategory } from '../../types/node';
import DraggableNode from './DraggableNode';

interface Props {
  category: NodeCategory;
}

const categoryIcons: Record<string, string> = {
  '大模型节点': '🧠',
  '工具节点': '🔧',
};

export default function NodeCategoryGroup({ category }: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
      >
        <span className={`transition-transform duration-200 text-xs ${expanded ? 'rotate-90' : ''}`}>&#9654;</span>
        <span className="text-base">{categoryIcons[category.category] || '📦'}</span>
        <span>{category.category}</span>
        <span className="ml-auto text-xs text-gray-400 font-normal">{category.nodes.length}个</span>
      </button>
      {expanded && (
        <div className="mt-3 space-y-2">
          {category.nodes.map((node) => (
            <DraggableNode key={node.nodeKey} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}

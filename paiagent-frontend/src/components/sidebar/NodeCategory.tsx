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
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full text-left text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span className={`transition-transform text-xs ${expanded ? 'rotate-90' : ''}`}>&#9654;</span>
        <span>{categoryIcons[category.category] || '📦'}</span>
        <span>{category.category}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1.5 ml-1">
          {category.nodes.map((node) => (
            <DraggableNode key={node.nodeKey} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}

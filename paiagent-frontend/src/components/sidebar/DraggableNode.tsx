import type { NodeDefinition } from '../../types/node';

interface Props {
  node: NodeDefinition;
}

const nodeIcons: Record<string, string> = {
  deepseek: '🐙',
  qwen: '🌟',
  aiping: '🏓',
  zhipu: '🧿',
  voice_synthesis: '🎙️',
};

export default function DraggableNode({ node }: Props) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/paiagent-node', JSON.stringify(node));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 px-2.5 py-2 bg-white rounded-lg cursor-grab hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 active:cursor-grabbing overflow-hidden"
    >
      <span className="text-base flex-shrink-0">{nodeIcons[node.nodeKey] || '📦'}</span>
      <span className="text-sm text-gray-700 font-medium truncate">{node.label}</span>
    </div>
  );
}

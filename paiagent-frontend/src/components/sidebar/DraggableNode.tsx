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
      className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg cursor-grab hover:bg-blue-50 hover:shadow-sm transition-all border border-transparent hover:border-blue-200 active:cursor-grabbing"
    >
      <span className="text-lg">{nodeIcons[node.nodeKey] || '📦'}</span>
      <span className="text-sm text-gray-700">{node.label}</span>
    </div>
  );
}

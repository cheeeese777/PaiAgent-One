import { useEffect, useState } from 'react';
import { nodeApi } from '../../api/node';
import type { NodeCategory } from '../../types/node';
import NodeCategoryGroup from './NodeCategory';

export default function NodeLibrary() {
  const [categories, setCategories] = useState<NodeCategory[]>([]);

  useEffect(() => {
    nodeApi.getDefinitions().then(setCategories).catch(console.error);
  }, []);

  // Fallback categories when API is unavailable
  const displayCategories = categories.length > 0 ? categories : [
    {
      category: '大模型节点',
      nodes: [
        { id: 1, nodeKey: 'deepseek', nodeType: 'LLM', label: 'DeepSeek', category: '大模型节点', iconUrl: '', configSchema: '{}', defaultConfig: '{"provider":"deepseek","model":"deepseek-chat","temperature":0.7}' },
        { id: 2, nodeKey: 'qwen', nodeType: 'LLM', label: '通义千问', category: '大模型节点', iconUrl: '', configSchema: '{}', defaultConfig: '{"provider":"qwen","model":"qwen-turbo","temperature":0.7}' },
        { id: 3, nodeKey: 'aiping', nodeType: 'LLM', label: 'AI Ping', category: '大模型节点', iconUrl: '', configSchema: '{}', defaultConfig: '{"provider":"aiping","model":"aiping-default","temperature":0.7}' },
        { id: 4, nodeKey: 'zhipu', nodeType: 'LLM', label: '智谱', category: '大模型节点', iconUrl: '', configSchema: '{}', defaultConfig: '{"provider":"zhipu","model":"glm-4","temperature":0.7}' },
      ],
    },
    {
      category: '工具节点',
      nodes: [
        { id: 5, nodeKey: 'voice_synthesis', nodeType: 'TOOL', label: '超拟人音频合成', category: '工具节点', iconUrl: '', configSchema: '{}', defaultConfig: '{"toolType":"voice_synthesis","voice":"narrator","speed":1.0}' },
      ],
    },
  ];

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-xl">📚</span>
        节点库
      </h2>
      <div className="space-y-5">
        {displayCategories.map((cat) => (
          <NodeCategoryGroup key={cat.category} category={cat} />
        ))}
      </div>
      <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-1">
          <span>💡</span>
          <span>拖拽节点到画布中使用</span>
        </p>
      </div>
    </div>
  );
}

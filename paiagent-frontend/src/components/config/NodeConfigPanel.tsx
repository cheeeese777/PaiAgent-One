import { useFlowStore } from '../../store/useFlowStore';
import type { NodeData, OutputMapping } from '../../types/flow';

export default function NodeConfigPanel() {
  const { nodes, selectedNodeId, updateNodeData } = useFlowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">点击节点查看配置</p>
      </div>
    );
  }

  const nodeData = selectedNode.data as NodeData;

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold text-gray-800 mb-4">节点配置</h2>

      {/* Basic info */}
      <div className="space-y-3 mb-6">
        <div>
          <label className="text-xs text-gray-500">节点 ID</label>
          <div className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded mt-0.5">{selectedNode.id}</div>
        </div>
        <div>
          <label className="text-xs text-gray-500">节点类型</label>
          <div className="text-sm font-medium text-gray-800 mt-0.5">{selectedNode.type}</div>
        </div>
      </div>

      <hr className="border-gray-100 mb-4" />

      {/* Type-specific config */}
      {selectedNode.type === 'llm' && (
        <LLMConfig nodeData={nodeData} onUpdate={(data) => updateNodeData(selectedNode.id, data)} />
      )}
      {selectedNode.type === 'tool' && (
        <ToolConfig nodeData={nodeData} onUpdate={(data) => updateNodeData(selectedNode.id, data)} />
      )}
      {selectedNode.type === 'output' && (
        <OutputConfig
          nodeData={nodeData}
          allNodes={nodes}
          onUpdate={(data) => updateNodeData(selectedNode.id, data)}
        />
      )}
      {selectedNode.type === 'input' && (
        <div className="text-sm text-gray-500">输入节点接收用户调试输入，无需额外配置。</div>
      )}
    </div>
  );
}

function LLMConfig({ nodeData, onUpdate }: { nodeData: NodeData; onUpdate: (data: Partial<NodeData>) => void }) {
  const models: Record<string, string[]> = {
    deepseek: ['deepseek-chat', 'deepseek-coder'],
    qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    aiping: ['aiping-default'],
    zhipu: ['glm-4', 'glm-3-turbo'],
  };

  const availableModels = models[nodeData.provider || ''] || ['default'];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">提供商</label>
        <div className="text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1.5 rounded">{nodeData.provider || nodeData.nodeKey}</div>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">模型</label>
        <select
          value={nodeData.model || availableModels[0]}
          onChange={(e) => onUpdate({ model: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {availableModels.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">System Prompt</label>
        <textarea
          value={nodeData.systemPrompt || ''}
          onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="你是一个有帮助的AI助手..."
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Temperature: {nodeData.temperature ?? 0.7}</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={nodeData.temperature ?? 0.7}
          onChange={(e) => onUpdate({ temperature: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}

function ToolConfig({ nodeData, onUpdate }: { nodeData: NodeData; onUpdate: (data: Partial<NodeData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">工具类型</label>
        <div className="text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1.5 rounded">
          {nodeData.toolType || nodeData.nodeKey}
        </div>
      </div>
      {nodeData.toolType === 'voice_synthesis' && (
        <>
          <div>
            <label className="text-xs text-gray-500 block mb-1">音色</label>
            <select
              value={(nodeData.toolConfig as Record<string, string>)?.voice || 'narrator'}
              onChange={(e) => onUpdate({ toolConfig: { ...nodeData.toolConfig, voice: e.target.value } })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="male-1">男声1</option>
              <option value="female-1">女声1</option>
              <option value="narrator">解说员</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

function OutputConfig({
  nodeData,
  allNodes,
  onUpdate,
}: {
  nodeData: NodeData;
  allNodes: Array<{ id: string; data: NodeData; type?: string }>;
  onUpdate: (data: Partial<NodeData>) => void;
}) {
  const mappings: OutputMapping[] = nodeData.outputMappings || [{ name: 'output', mode: 'reference', value: '' }];

  // Build reference options from upstream nodes
  const refOptions: string[] = [];
  for (const node of allNodes) {
    if (node.type === 'output' || node.type === 'input') continue;
    const label = (node.data as NodeData).label;
    if (node.type === 'llm') {
      refOptions.push(`${label}.text`);
    }
    if (node.type === 'tool') {
      refOptions.push(`${label}.audioUrl`);
      refOptions.push(`${label}.text`);
    }
  }

  const updateMapping = (index: number, field: keyof OutputMapping, value: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ outputMappings: updated });
  };

  const addMapping = () => {
    onUpdate({ outputMappings: [...mappings, { name: '', mode: 'reference', value: '' }] });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-500 font-medium">输出配置</label>
          <button onClick={addMapping} className="text-xs text-blue-500 hover:text-blue-600">+ 添加</button>
        </div>
        {mappings.map((mapping, i) => (
          <div key={i} className="flex gap-1.5 mb-2 items-center">
            <input
              value={mapping.name}
              onChange={(e) => updateMapping(i, 'name', e.target.value)}
              className="w-20 text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="名称"
            />
            <select
              value={mapping.mode}
              onChange={(e) => updateMapping(i, 'mode', e.target.value as 'reference' | 'static')}
              className="text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="reference">引用</option>
              <option value="static">固定值</option>
            </select>
            {mapping.mode === 'reference' ? (
              <select
                value={mapping.value}
                onChange={(e) => updateMapping(i, 'value', e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">选择引用</option>
                {refOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                value={mapping.value}
                onChange={(e) => updateMapping(i, 'value', e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="固定值"
              />
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">回答内容配置</label>
        <textarea
          value={nodeData.responseTemplate || ''}
          onChange={(e) => onUpdate({ responseTemplate: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 h-24 resize-none font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="{{output}}"
        />
        <p className="text-xs text-gray-400 mt-1">
          提示: 使用 {'{{ 参数名 }}'} 引用上面定义的参数
        </p>
      </div>

      <button
        onClick={() => { /* Already auto-saves via onUpdate */ }}
        className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
      >
        保存配置
      </button>
    </div>
  );
}

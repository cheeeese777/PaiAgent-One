import { useFlowStore } from '../../store/useFlowStore';
import type { NodeData, OutputMapping, InputParameter, OutputParameter } from '../../types/flow';

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
        <LLMConfig nodeData={nodeData} allNodes={nodes} onUpdate={(data) => updateNodeData(selectedNode.id, data)} />
      )}
      {selectedNode.type === 'tool' && (
        <ToolConfig nodeData={nodeData} allNodes={nodes} onUpdate={(data) => updateNodeData(selectedNode.id, data)} />
      )}
      {selectedNode.type === 'output' && (
        <OutputConfig
          nodeData={nodeData}
          allNodes={nodes}
          onUpdate={(data) => updateNodeData(selectedNode.id, data)}
        />
      )}
      {selectedNode.type === 'input' && (
        <InputConfig nodeData={nodeData} onUpdate={(data) => updateNodeData(selectedNode.id, data)} />
      )}
    </div>
  );
}

function InputConfig({ nodeData, onUpdate }: { nodeData: NodeData; onUpdate: (data: Partial<NodeData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">变量名</label>
        <input
          type="text"
          value={nodeData.inputVariableName || 'user_input'}
          onChange={(e) => onUpdate({ inputVariableName: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="user_input"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">变量类型</label>
        <select
          value={nodeData.inputVariableType || 'String'}
          onChange={(e) => onUpdate({ inputVariableType: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="String">String</option>
          <option value="Number">Number</option>
          <option value="Boolean">Boolean</option>
          <option value="Object">Object</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">描述</label>
        <textarea
          value={nodeData.inputDescription || '用户本轮的输入内容'}
          onChange={(e) => onUpdate({ inputDescription: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="用户本轮的输入内容"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="input-required"
          checked={nodeData.inputRequired ?? true}
          onChange={(e) => onUpdate({ inputRequired: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="input-required" className="text-sm text-gray-700">必要</label>
      </div>
    </div>
  );
}

function LLMConfig({ nodeData, allNodes, onUpdate }: { nodeData: NodeData; allNodes: Array<{ id: string; data: NodeData; type?: string }>; onUpdate: (data: Partial<NodeData>) => void }) {
  const models: Record<string, string[]> = {
    deepseek: ['deepseek-chat', 'deepseek-coder'],
    qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    aiping: ['aiping-default'],
    zhipu: ['glm-4', 'glm-3-turbo'],
  };

  const availableModels = models[nodeData.provider || ''] || ['default'];
  const isDeepSeek = nodeData.provider === 'deepseek' || nodeData.nodeKey === 'deepseek';

  // Build reference options from all upstream nodes (excluding output nodes)
  const refOptions: string[] = [];
  for (const node of allNodes) {
    if (node.type === 'output') continue;
    const label = (node.data as NodeData).label;
    if (node.type === 'input') {
      const varName = (node.data as NodeData).inputVariableName || 'user_input';
      refOptions.push(`${label}.${varName}`);
    }
    if (node.type === 'llm') {
      refOptions.push(`${label}.text`);
    }
    if (node.type === 'tool') {
      refOptions.push(`${label}.audioUrl`);
      refOptions.push(`${label}.text`);
    }
  }

  const inputParams = nodeData.inputParameters || [{ name: 'input', parameterType: 'reference' as const, value: '' }];

  const updateInputParam = (index: number, field: keyof InputParameter, value: string) => {
    const updated = [...inputParams];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ inputParameters: updated });
  };

  const addInputParam = () => {
    onUpdate({ inputParameters: [...inputParams, { name: '', parameterType: 'reference' as const, value: '' }] });
  };

  const removeInputParam = (index: number) => {
    const updated = inputParams.filter((_, i) => i !== index);
    onUpdate({ inputParameters: updated.length > 0 ? updated : [{ name: '', parameterType: 'reference' as const, value: '' }] });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">提供商</label>
        <div className="text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1.5 rounded">{nodeData.provider || nodeData.nodeKey}</div>
      </div>

      {/* DeepSeek 专属配置 */}
      {isDeepSeek && (
        <>
          <div>
            <label className="text-xs text-gray-500 block mb-1">接口地址</label>
            <input
              type="text"
              value={nodeData.apiUrl || ''}
              onChange={(e) => onUpdate({ apiUrl: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="https://api.deepseek.com/v1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">API 密钥</label>
            <input
              type="password"
              value={nodeData.apiKey || ''}
              onChange={(e) => onUpdate({ apiKey: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="sk-..."
            />
          </div>
        </>
      )}

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

      {/* Input Parameters - 动态输入参数 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-500 font-medium">输入参数</label>
          <button onClick={addInputParam} className="text-xs text-blue-500 hover:text-blue-600">+ 添加</button>
        </div>
        {inputParams.map((param, i) => (
          <div key={i} className="flex gap-1.5 mb-2 items-start">
            <div className="flex-1 space-y-1.5">
              <input
                value={param.name}
                onChange={(e) => updateInputParam(i, 'name', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="参数名"
              />
              <select
                value={param.parameterType}
                onChange={(e) => updateInputParam(i, 'parameterType', e.target.value as 'input' | 'reference')}
                className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="input">输入</option>
                <option value="reference">引用</option>
              </select>
              {param.parameterType === 'input' ? (
                <input
                  value={param.value}
                  onChange={(e) => updateInputParam(i, 'value', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="手动输入值"
                />
              ) : (
                <select
                  value={param.value}
                  onChange={(e) => updateInputParam(i, 'value', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="">选择引用</option>
                  {refOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
            <button
              onClick={() => removeInputParam(i)}
              className="text-red-400 hover:text-red-600 px-1 py-1 text-xs"
              title="删除"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">System Prompt</label>
        <textarea
          value={nodeData.systemPrompt || ''}
          onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="你是一个有帮助的AI助手..."
        />
      </div>

      {/* User Prompt - 用户提示词 */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">用户提示词</label>
        <textarea
          value={nodeData.userPrompt || ''}
          onChange={(e) => onUpdate({ userPrompt: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 h-20 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="请输入您的内容：{{input}}"
        />
        <p className="text-xs text-gray-400 mt-1">
          使用 {'{{'}参数名{'}'}  引用上面定义的参数，例如 {'{{input}}'}
        </p>
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

      {/* Output Parameters - 输出参数 */}
      <OutputParametersConfig nodeData={nodeData} onUpdate={onUpdate} />
    </div>
  );
}

function OutputParametersConfig({ nodeData, onUpdate }: { nodeData: NodeData; onUpdate: (data: Partial<NodeData>) => void }) {
  const outputParams = nodeData.outputParameters || [{ name: 'text', type: 'string', description: '模型生成的文本内容' }];

  const updateParam = (index: number, field: keyof OutputParameter, value: string) => {
    const updated = [...outputParams];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ outputParameters: updated });
  };

  const addParam = () => {
    onUpdate({ outputParameters: [...outputParams, { name: '', type: 'string', description: '' }] });
  };

  const removeParam = (index: number) => {
    const updated = outputParams.filter((_, i) => i !== index);
    onUpdate({ outputParameters: updated.length > 0 ? updated : [{ name: '', type: 'string', description: '' }] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-gray-500 font-medium">输出参数</label>
        <button onClick={addParam} className="text-xs text-blue-500 hover:text-blue-600">+ 添加</button>
      </div>
      {outputParams.map((param, i) => (
        <div key={i} className="flex gap-1.5 mb-2 items-start">
          <div className="flex-1 space-y-1.5">
            <input
              value={param.name}
              onChange={(e) => updateParam(i, 'name', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="变量名"
            />
            <select
              value={param.type}
              onChange={(e) => updateParam(i, 'type', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="string">String</option>
            </select>
            <input
              value={param.description || ''}
              onChange={(e) => updateParam(i, 'description', e.target.value)}
              className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="描述（可选）"
            />
          </div>
          <button
            onClick={() => removeParam(i)}
            className="text-red-400 hover:text-red-600 px-1 py-1 text-xs"
            title="删除"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function ToolConfig({ nodeData, allNodes, onUpdate }: { nodeData: NodeData; allNodes: Array<{ id: string; data: NodeData; type?: string }>; onUpdate: (data: Partial<NodeData>) => void }) {
  const isVoiceSynthesis = nodeData.toolType === 'voice_synthesis' || nodeData.nodeKey === 'voice_synthesis';

  // Build reference options from all upstream nodes (excluding output nodes)
  const refOptions: string[] = [];
  for (const node of allNodes) {
    if (node.type === 'output') continue;
    const label = (node.data as NodeData).label;
    if (node.type === 'input') {
      const varName = (node.data as NodeData).inputVariableName || 'user_input';
      refOptions.push(`${label}.${varName}`);
    }
    if (node.type === 'llm') {
      refOptions.push(`${label}.text`);
    }
    if (node.type === 'tool') {
      refOptions.push(`${label}.audioUrl`);
      refOptions.push(`${label}.text`);
    }
  }

  const inputParams = nodeData.inputParameters || [
    { name: 'text', parameterType: 'reference' as const, value: '' },
    { name: 'voice', parameterType: 'input' as const, value: 'Cherry' },
    { name: 'language_type', parameterType: 'input' as const, value: 'Auto' }
  ];

  const updateInputParam = (index: number, field: keyof InputParameter, value: string) => {
    const updated = [...inputParams];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ inputParameters: updated });
  };

  const addInputParam = () => {
    onUpdate({ inputParameters: [...inputParams, { name: '', parameterType: 'reference' as const, value: '' }] });
  };

  const removeInputParam = (index: number) => {
    const updated = inputParams.filter((_, i) => i !== index);
    onUpdate({ inputParameters: updated.length > 0 ? updated : [{ name: '', parameterType: 'reference' as const, value: '' }] });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">工具类型</label>
        <div className="text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1.5 rounded">
          {nodeData.toolType || nodeData.nodeKey}
        </div>
      </div>

      {/* 超拟人音频合成专属配置 */}
      {isVoiceSynthesis && (
        <>
          <div>
            <label className="text-xs text-gray-500 block mb-1">API Key</label>
            <input
              type="password"
              value={(nodeData.toolConfig as Record<string, string>)?.apiKey || ''}
              onChange={(e) => onUpdate({ toolConfig: { ...nodeData.toolConfig, apiKey: e.target.value } })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="输入 API Key"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">模型名称</label>
            <input
              type="text"
              value={(nodeData.toolConfig as Record<string, string>)?.modelName || 'qwen3-tts-flash'}
              onChange={(e) => onUpdate({ toolConfig: { ...nodeData.toolConfig, modelName: e.target.value } })}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="qwen3-tts-flash"
            />
          </div>

          {/* Input Parameters - 输入参数配置 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-medium">输入参数</label>
              <button onClick={addInputParam} className="text-xs text-blue-500 hover:text-blue-600">+ 添加</button>
            </div>
            {inputParams.map((param, i) => (
              <div key={i} className="flex gap-1.5 mb-2 items-start">
                <div className="flex-1 space-y-1.5">
                  <input
                    value={param.name}
                    onChange={(e) => updateInputParam(i, 'name', e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="参数名"
                  />
                  {/* voice 和 language_type 固定为 input 类型，不显示选择器 */}
                  {param.name === 'voice' || param.name === 'language_type' ? (
                    <>
                      <input type="hidden" value="input" readOnly />
                      {param.name === 'voice' ? (
                        <select
                          value={param.value || 'Cherry'}
                          onChange={(e) => updateInputParam(i, 'value', e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          <option value="Cherry">Cherry</option>
                          <option value="Serena">Serena</option>
                          <option value="Ethan">Ethan</option>
                        </select>
                      ) : (
                        <select
                          value={param.value || 'Auto'}
                          onChange={(e) => updateInputParam(i, 'value', e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          <option value="Auto">Auto</option>
                        </select>
                      )}
                    </>
                  ) : (
                    <>
                      <select
                        value={param.parameterType}
                        onChange={(e) => updateInputParam(i, 'parameterType', e.target.value as 'input' | 'reference')}
                        className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="input">输入</option>
                        <option value="reference">引用</option>
                      </select>
                      {param.parameterType === 'input' ? (
                        <input
                          value={param.value}
                          onChange={(e) => updateInputParam(i, 'value', e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="手动输入值"
                        />
                      ) : (
                        <select
                          value={param.value}
                          onChange={(e) => updateInputParam(i, 'value', e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          <option value="">选择引用</option>
                          {refOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={() => removeInputParam(i)}
                  className="text-red-400 hover:text-red-600 px-1 py-1 text-xs"
                  title="删除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Output Parameters - 输出参数配置 */}
          <OutputParametersConfig nodeData={nodeData} onUpdate={onUpdate} />
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
  const mappings = nodeData.outputMappings || [{ name: 'output', parameterType: 'reference' as const, mode: 'reference' as const, value: '' }];

  // Build reference options from upstream nodes
  const refOptions: string[] = [];
  for (const node of allNodes) {
    if (node.type === 'output') continue;
    const label = (node.data as NodeData).label;
    if (node.type === 'input') {
      const varName = (node.data as NodeData).inputVariableName || 'user_input';
      refOptions.push(`${label}.${varName}`);
    }
    if (node.type === 'llm') {
      refOptions.push(`${label}.text`);
    }
    if (node.type === 'tool') {
      refOptions.push(`${label}.audioUrl`);
      refOptions.push(`${label}.text`);
    }
  }

  const updateMapping = (index: number, field: keyof typeof mappings[number], value: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ outputMappings: updated });
  };

  const addMapping = () => {
    onUpdate({ outputMappings: [...mappings, { name: '', parameterType: 'reference' as const, mode: 'reference' as const, value: '' }] });
  };

  const removeMapping = (index: number) => {
    const updated = mappings.filter((_, i) => i !== index);
    onUpdate({ outputMappings: updated.length > 0 ? updated : [{ name: '', parameterType: 'reference' as const, mode: 'reference' as const, value: '' }] });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-500 font-medium">输出配置</label>
          <button onClick={addMapping} className="text-xs text-blue-500 hover:text-blue-600">+ 添加</button>
        </div>
        {mappings.map((mapping, i) => (
          <div key={i} className="flex gap-1.5 mb-2 items-start">
            <div className="flex-1 space-y-1.5">
              <input
                value={mapping.name}
                onChange={(e) => updateMapping(i, 'name', e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="参数名"
              />
              <select
                value={mapping.parameterType}
                onChange={(e) => updateMapping(i, 'parameterType', e.target.value as 'input' | 'reference')}
                className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="input">输入</option>
                <option value="reference">引用</option>
              </select>
              {mapping.parameterType === 'input' ? (
                <input
                  value={mapping.value}
                  onChange={(e) => updateMapping(i, 'value', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="手动输入值"
                />
              ) : (
                <select
                  value={mapping.value}
                  onChange={(e) => updateMapping(i, 'value', e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="">选择引用</option>
                  {refOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
            <button
              onClick={() => removeMapping(i)}
              className="text-red-400 hover:text-red-600 px-1 py-1 text-xs"
              title="删除"
            >
              ×
            </button>
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
          提示: 使用 {'{{'}参数名{'}'} 或 {'{{output}}'} 引用上面定义的参数
        </p>
      </div>
    </div>
  );
}

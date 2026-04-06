import { useState } from 'react';
import { useFlowStore } from '../../store/useFlowStore';
import { useExecutionStore } from '../../store/useExecutionStore';
import { executionApi } from '../../api/execution';

interface Props {
  onClose: () => void;
}

export default function DebugDrawer({ onClose }: Props) {
  const [inputText, setInputText] = useState('');
  const flowId = useFlowStore((s) => s.flowId);
  const { isRunning, result, nodeStatuses, startExecution, setNodeStatus, setResult } = useExecutionStore();

  const handleRun = async () => {
    if (!inputText.trim()) return;

    // If no saved workflow, save first (or use temp execution)
    if (!flowId) {
      // For debug, we still need a workflow ID from backend
      // Just show a message
      alert('请先保存工作流后再调试');
      return;
    }

    startExecution(0);

    try {
      const res = await executionApi.run({ workflowId: flowId, inputData: JSON.stringify({ text: inputText }) });

      // Parse node results to update statuses
      if (res.nodeResults) {
        try {
          const nodeResults = JSON.parse(res.nodeResults);
          for (const [nodeId, nodeResult] of Object.entries(nodeResults)) {
            const r = nodeResult as { status: string };
            setNodeStatus(nodeId, r.status === 'SUCCESS' ? 'done' : 'error');
          }
        } catch {
          // ignore parse error
        }
      }

      setResult({
        outputData: res.outputData || '',
        nodeResults: res.nodeResults || '{}',
        durationMs: res.durationMs,
        errorMessage: res.errorMessage,
        status: res.status,
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '执行失败';
      setResult({
        outputData: '',
        nodeResults: '{}',
        durationMs: 0,
        errorMessage,
        status: 'FAILED',
      });
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">调试面板</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>
      <div className="p-4 flex gap-4" style={{ height: '240px' }}>
        {/* Input */}
        <div className="flex-1 flex flex-col">
          <label className="text-xs text-gray-500 mb-1">输入内容</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="输入测试内容..."
          />
          <button
            onClick={handleRun}
            disabled={isRunning || !inputText.trim()}
            className="mt-2 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isRunning ? '执行中...' : '运行'}
          </button>
        </div>

        {/* Node Status Timeline */}
        <div className="w-48 flex flex-col">
          <label className="text-xs text-gray-500 mb-1">执行进度</label>
          <div className="flex-1 overflow-y-auto space-y-1.5 bg-gray-50 rounded-lg p-2">
            {Object.entries(nodeStatuses).length === 0 ? (
              <p className="text-xs text-gray-400 text-center mt-4">等待执行...</p>
            ) : (
              Object.entries(nodeStatuses).map(([nodeId, status]) => (
                <div key={nodeId} className="flex items-center gap-1.5 text-xs">
                  <span>
                    {status === 'running' && '🔄'}
                    {status === 'done' && '✅'}
                    {status === 'error' && '❌'}
                    {status === 'pending' && '⏳'}
                  </span>
                  <span className="text-gray-600 truncate">{nodeId}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col">
          <label className="text-xs text-gray-500 mb-1">执行结果</label>
          <div className="flex-1 bg-gray-50 rounded-lg p-3 overflow-y-auto text-sm">
            {!result ? (
              <p className="text-gray-400 text-center mt-4">等待执行结果...</p>
            ) : result.status === 'FAILED' ? (
              <div className="text-red-500">
                <p className="font-medium">执行失败</p>
                <p className="mt-1 text-xs">{result.errorMessage}</p>
              </div>
            ) : (
              <div>
                <p className="text-green-600 font-medium mb-2">
                  执行成功 ({result.durationMs}ms)
                </p>
                <div className="text-gray-700 whitespace-pre-wrap text-xs">
                  {result.outputData}
                </div>
                {/* Audio player placeholder */}
                {result.outputData && result.outputData.includes('/audio/') && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">🎧 AI 播客音频</p>
                    <div className="bg-white rounded p-2 text-xs text-gray-500">
                      音频 URL: {result.outputData}
                      <br />
                      <em>(Mock 模式 - 实际音频播放将在对接真实 API 后可用)</em>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

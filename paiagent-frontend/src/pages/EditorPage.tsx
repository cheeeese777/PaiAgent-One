import { useCallback, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFlowStore } from '../store/useFlowStore';
import { useExecutionStore } from '../store/useExecutionStore';
import { workflowApi } from '../api/workflow';
import Header from '../components/layout/Header';
import NodeLibrary from '../components/sidebar/NodeLibrary';
import FlowCanvas from '../components/canvas/FlowCanvas';
import NodeConfigPanel from '../components/config/NodeConfigPanel';
import DebugDrawer from '../components/debug/DebugDrawer';

export default function EditorPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { flowId, flowName, setFlowName, loadFlow, resetFlow, getFlowJson } = useFlowStore();
  const { isDebugging, setDebugging } = useExecutionStore();
  const [saving, setSaving] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [workflowList, setWorkflowList] = useState<Array<{id: number; name: string; updatedAt: string}>>([]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const json = getFlowJson();
      if (flowId) {
        await workflowApi.update(flowId, { name: flowName, flowJson: json });
      } else {
        const created = await workflowApi.create({ name: flowName, flowJson: json });
        if (created.id) {
          useFlowStore.getState().setFlowId(created.id);
        }
      }
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  }, [flowId, flowName, getFlowJson]);

  const handleNew = useCallback(() => {
    resetFlow();
  }, [resetFlow]);

  const handleLoad = useCallback(async () => {
    try {
      const list = await workflowApi.list();
      setWorkflowList(list);
      setLoadModalOpen(true);
    } catch (e) {
      console.error('Load list failed', e);
    }
  }, []);

  const handleLoadWorkflow = useCallback(async (id: number) => {
    try {
      const wf = await workflowApi.get(id);
      const flow = JSON.parse(wf.flowJson);
      loadFlow(id, wf.name, flow.nodes || [], flow.edges || []);
      setLoadModalOpen(false);
    } catch (e) {
      console.error('Load workflow failed', e);
    }
  }, [loadFlow]);

  return (
    <div className="h-full flex flex-col">
      <Header
        flowName={flowName}
        onFlowNameChange={setFlowName}
        onNew={handleNew}
        onLoad={handleLoad}
        onSave={handleSave}
        onDebug={() => setDebugging(!isDebugging)}
        saving={saving}
        username={user?.displayName || user?.username || ''}
        onLogout={logout}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Library */}
        <div className="w-[260px] border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          <NodeLibrary />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 relative">
          <FlowCanvas />
        </div>

        {/* Right Panel - Node Config */}
        <div className="w-[320px] border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          <NodeConfigPanel />
        </div>
      </div>

      {/* Debug Drawer */}
      {isDebugging && (
        <DebugDrawer onClose={() => setDebugging(false)} />
      )}

      {/* Load Workflow Modal */}
      {loadModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setLoadModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[460px] max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">加载工作流</h3>
            {workflowList.length === 0 ? (
              <p className="text-gray-400 text-center py-8">暂无保存的工作流</p>
            ) : (
              <div className="space-y-2">
                {workflowList.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => handleLoadWorkflow(wf.id)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium">{wf.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{wf.updatedAt}</div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setLoadModalOpen(false)}
              className="mt-4 w-full py-2 text-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

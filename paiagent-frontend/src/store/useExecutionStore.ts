import { create } from 'zustand';

type NodeStatus = 'pending' | 'running' | 'done' | 'error';

interface ExecutionState {
  isDebugging: boolean;
  isRunning: boolean;
  executionId: number | null;
  nodeStatuses: Record<string, NodeStatus>;
  result: {
    outputData: string;
    nodeResults: string;
    durationMs: number;
    errorMessage?: string;
    status: string;
  } | null;

  setDebugging: (value: boolean) => void;
  startExecution: (executionId: number) => void;
  setNodeStatus: (nodeId: string, status: NodeStatus) => void;
  setResult: (result: ExecutionState['result']) => void;
  reset: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  isDebugging: false,
  isRunning: false,
  executionId: null,
  nodeStatuses: {},
  result: null,

  setDebugging: (value) => set({ isDebugging: value }),

  startExecution: (executionId) =>
    set({ isRunning: true, executionId, nodeStatuses: {}, result: null }),

  setNodeStatus: (nodeId, status) =>
    set((state) => ({
      nodeStatuses: { ...state.nodeStatuses, [nodeId]: status },
    })),

  setResult: (result) => set({ isRunning: false, result }),

  reset: () =>
    set({
      isRunning: false,
      executionId: null,
      nodeStatuses: {},
      result: null,
    }),
}));

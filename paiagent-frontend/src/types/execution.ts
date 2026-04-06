export interface ExecutionResult {
  id: number;
  workflowId: number;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  inputData: string;
  outputData: string;
  nodeResults: string;
  errorMessage: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}

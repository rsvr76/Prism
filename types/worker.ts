import { ExecutionLimits, ExecutionStatus, PrismTrace } from './trace';

export type WorkerCommand = 'INIT' | 'RUN_CODE' | 'PING';

export interface RunCodePayload {
  code: string;
  limits: ExecutionLimits;
  tracerCode: string;
}

export interface WorkerInMessage {
  id: string;
  command: WorkerCommand;
  payload?: RunCodePayload;
}

export type WorkerResponseType =
  | 'READY'
  | 'EXECUTION_STARTED'
  | 'EXECUTION_COMPLETE'
  | 'EXECUTION_ERROR'
  | 'PONG';

export interface WorkerOutMessage {
  id: string;
  type: WorkerResponseType;
  trace?: PrismTrace;
  status?: ExecutionStatus;
  error?: string;
}

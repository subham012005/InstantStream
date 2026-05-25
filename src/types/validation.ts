export type ValidationStep = 
  | "format"
  | "connection"
  | "filetype"
  | "streaming"
  | "preparing";

export type StepStatus = "pending" | "checking" | "success" | "error";

export interface ValidationStepState {
  step: ValidationStep;
  status: StepStatus;
  label: string;
  message?: string;
}

export interface ValidationResponse {
  valid: boolean;
  streamUrl?: string;
  title?: string;
  type?: string;
  contentType?: string;
  error?: string;
  warning?: string;
  steps?: ValidationStepState[];
  supportsStreaming?: boolean;
  acceptRanges?: boolean;
  contentLength?: number;
}

export interface StreamMetadata {
  streamUrl: string;
  title: string;
  type: string;
  contentType: string;
  supportsStreaming: boolean;
  acceptRanges: boolean;
  contentLength?: number;
}

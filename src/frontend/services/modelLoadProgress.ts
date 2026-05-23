export interface ModelLoadProgress {
  stage: 'wasm' | 'verify' | 'download' | 'init' | 'inference' | 'details' | 'complete';
  percent: number;
  message: string;
  subMessage?: string;
}

export type ProgressReporter = (progress: ModelLoadProgress) => void;

export const STAGE_MESSAGES: Record<ModelLoadProgress['stage'], string> = {
  wasm: 'Loading AI engine (first visit may download ~20 MB)...',
  verify: 'Checking breed model on server...',
  download: 'Downloading breed classification model (~90 MB)...',
  init: 'Preparing model for analysis...',
  inference: 'Analyzing your image...',
  details: 'Loading breed information...',
  complete: 'Done',
};

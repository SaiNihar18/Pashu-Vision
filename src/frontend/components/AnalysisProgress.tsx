import React from 'react';

export interface AnalysisProgressState {
  stage: string;
  percent: number;
  message: string;
  subMessage?: string;
}

interface AnalysisProgressProps {
  progress: AnalysisProgressState;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ progress }) => {
  const clamped = Math.min(100, Math.max(0, progress.percent));

  return (
    <div className="w-full mt-6 p-4 bg-base-200/60 border border-base-400/20 rounded-xl">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold text-contrast-100">{progress.message}</p>
        <span className="text-xs font-bold text-brand-primary">{Math.round(clamped)}%</span>
      </div>
      <div className="h-2.5 w-full bg-base-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-primary to-brand-primary-light transition-all duration-300 ease-out rounded-full"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {progress.subMessage && (
        <p className="mt-2 text-xs text-contrast-300">{progress.subMessage}</p>
      )}
      <p className="mt-1 text-xs text-contrast-300 capitalize">Stage: {progress.stage}</p>
    </div>
  );
};

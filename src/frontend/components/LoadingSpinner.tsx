import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  subMessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Analyzing Image...', 
  subMessage = 'The AI is identifying the breed. Please wait.' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className={`${sizeClasses[size]} border-4 border-brand-primary border-t-transparent rounded-full animate-spin`}></div>
      <p className="mt-4 text-lg font-semibold text-contrast-200">
        {message}
      </p>
      <p className="text-sm text-contrast-300">{subMessage}</p>
    </div>
  );
};
import React from 'react';
import { InfoIcon } from './icons';

interface InstructionCardProps {
  title: { en: string; hi: string };
  steps: Array<{ en: string; hi: string }>;
  tips?: Array<{ en: string; hi: string }>;
  currentLang?: 'en' | 'hi';
}

const InstructionCard: React.FC<InstructionCardProps> = ({ 
  title, 
  steps, 
  tips = [], 
  currentLang = 'en' 
}) => {
  return (
    <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-light rounded-full flex items-center justify-center text-white">
          <InfoIcon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-contrast-100">{title[currentLang]}</h3>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <p className="text-sm text-contrast-200">{step[currentLang]}</p>
          </div>
        ))}
      </div>
      
      {tips.length > 0 && (
        <div className="mt-6 pt-4 border-t border-base-400/20">
          <h4 className="text-sm font-semibold text-contrast-100 mb-3">
            {currentLang === 'en' ? 'Tips for better results:' : 'बेहतर परिणाम के लिए सुझाव:'}
          </h4>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="text-xs text-contrast-300 flex items-start space-x-2">
                <span className="text-brand-primary mt-1">•</span>
                <span>{tip[currentLang]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InstructionCard;
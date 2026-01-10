import React from 'react';
import type { View } from '../App';
import { ArrowLeftIcon } from './icons';

interface PageHeaderProps {
  navigateTo: (view: View) => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ navigateTo }) => {
  return (
    <header className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-lg shadow-sm border-b border-base-400/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex-1">
             <button
              onClick={() => navigateTo('home')}
              className="flex items-center text-sm font-semibold text-contrast-300 hover:text-brand-primary transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-contrast-100 tracking-tight">Pashu Vision</h1>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
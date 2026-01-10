import React, { useState, useEffect } from 'react';
import type { View } from '../App';
import type { HistoryEntry } from '../types';
import { getHistory, clearHistory } from '../services/historyService';
import PageHeader from '../components/PageHeader';
import { EyeIcon, RefreshCwIcon, Trash2Icon, DatabaseIcon } from '../components/icons';

interface HistoryPageProps {
  navigateTo: (view: View, context?: any) => void;
}

const HistoryCard: React.FC<{ item: HistoryEntry; onSelect: (mode: 'view' | 'reanalyze') => void; }> = ({ item, onSelect }) => {
  return (
    <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-4">
      <img src={item.imageDataUrl} alt={item.result.breed_name} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg shadow-md border-2 border-base-300" />
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-xl font-bold text-contrast-100">{item.result.breed_name}</h3>
        <p className="text-sm text-contrast-300">Confidence: {item.result.confidence}%</p>
        <p className="text-xs text-contrast-300 mt-1">{new Date(item.date).toLocaleString()}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          onClick={() => onSelect('view')}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-base-300/50 border border-base-400/20 rounded-lg text-sm font-semibold hover:bg-base-300 transition-colors"
        >
          <EyeIcon className="w-4 h-4 mr-2" />
          View
        </button>
        <button
          onClick={() => onSelect('reanalyze')}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-brand-secondary/80 text-white rounded-lg text-sm font-semibold hover:bg-brand-secondary transition-colors"
        >
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Re-analyze
        </button>
      </div>
    </div>
  );
};

const HistoryPage: React.FC<HistoryPageProps> = ({ navigateTo }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all analysis history? This action cannot be undone.')) {
      clearHistory();
      setHistory(getHistory()); // Re-fetch from storage to ensure UI is in sync
    }
  };
  
  const handleSelectEntry = (item: HistoryEntry, mode: 'view' | 'reanalyze') => {
    navigateTo('quick', { item, mode });
  };

  return (
    <div className="min-h-screen">
      <PageHeader navigateTo={navigateTo} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-contrast-100">Analysis History</h2>
              <p className="text-contrast-300 mt-1">Review your past breed identifications.</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <Trash2Icon className="w-4 h-4" />
                Clear History
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map(item => (
                <HistoryCard key={item.id} item={item} onSelect={(mode) => handleSelectEntry(item, mode)} />
              ))}
            </div>
          ) : (
            <div className="text-center bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-12 rounded-2xl shadow-xl">
              <div className="w-20 h-20 rounded-full bg-base-300/50 flex items-center justify-center mx-auto mb-4">
                <DatabaseIcon className="w-10 h-10 text-contrast-300"/>
              </div>
              <h3 className="text-xl font-bold text-contrast-200">No History Found</h3>
              <p className="text-contrast-300 max-w-sm mx-auto mt-2">
                Your past analyses will appear here. Start by identifying an animal using the 'Quick Analysis' feature.
              </p>
              <button
                onClick={() => navigateTo('quick')}
                className="mt-6 px-6 py-2 bg-gradient-to-br from-brand-primary-dark to-brand-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Start Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
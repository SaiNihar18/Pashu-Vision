import React from 'react';
import type { HistoryEntry } from '../types';
import { CalendarIcon, EyeIcon, RefreshCwIcon, TrashIcon } from './icons';

interface HistoryProps {
  entries: HistoryEntry[];
  onView?: (entry: HistoryEntry) => void;
  onReanalyze?: (entry: HistoryEntry) => void;
  onDelete?: (entryId: string) => void;
  currentLang?: 'en' | 'hi';
}

const History: React.FC<HistoryProps> = ({ 
  entries, 
  onView, 
  onReanalyze, 
  onDelete, 
  currentLang = 'en' 
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(currentLang === 'hi' ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-base-200/50 rounded-full mx-auto flex items-center justify-center mb-4">
          <CalendarIcon className="w-8 h-8 text-contrast-300" />
        </div>
        <p className="text-contrast-300 text-lg">
          {currentLang === 'en' ? 'No analysis history' : 'कोई विश्लेषण इतिहास नहीं'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 rounded-xl p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex space-x-4 flex-1">
              {/* Image Thumbnail */}
              <div className="flex-shrink-0">
                <img 
                  src={entry.imageUrl} 
                  alt="Analysis" 
                  className="w-16 h-16 object-cover rounded-lg border border-base-400/20"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-contrast-100 truncate">
                    {entry.result.breed_name}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    entry.result.confidence >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : entry.result.confidence >= 60 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {entry.result.confidence}%
                  </span>
                </div>
                
                <p className="text-sm text-contrast-300 mb-2 line-clamp-2">
                  {entry.result.short_description}
                </p>
                
                <div className="flex items-center text-xs text-contrast-300">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {formatDate(entry.timestamp)}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {onView && (
                <button
                  onClick={() => onView(entry)}
                  className="p-2 text-contrast-300 hover:text-brand-primary hover:bg-base-200/50 rounded-lg transition-colors"
                  title={currentLang === 'en' ? 'View details' : 'विवरण देखें'}
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              )}
              
              {onReanalyze && (
                <button
                  onClick={() => onReanalyze(entry)}
                  className="p-2 text-contrast-300 hover:text-brand-primary hover:bg-base-200/50 rounded-lg transition-colors"
                  title={currentLang === 'en' ? 'Analyze again' : 'पुन: विश्लेषण करें'}
                >
                  <RefreshCwIcon className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-2 text-contrast-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title={currentLang === 'en' ? 'Delete' : 'हटाएं'}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default History;
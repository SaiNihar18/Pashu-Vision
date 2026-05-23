import React, { useState, useCallback, useEffect } from 'react';
import HomePage from './pages/HomePage';
import QuickAnalysisPage from './pages/QuickAnalysisPage';
import MultiAnglePage from './pages/MultiAnglePage';
import HealthAssessmentPage from './pages/HealthAssessmentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VoiceCommandsPage from './pages/VoiceCommandsPage';
import BreedDatabasePage from './pages/BreedDatabasePage';
import HistoryPage from './pages/HistoryPage';
import ChatPage from './pages/ChatPage';
import BatchProcessingPage from './pages/BatchProcessingPage';
import LocationPage from './pages/LocationPage';
import type { HistoryEntry } from './types';
import { useVoiceCommands } from './contexts/VoiceCommandContext';

export interface BreedPrediction {
  breedName: string;
  confidence: number;
}

export type View = 'home' | 'quick' | 'multiAngle' | 'health' | 'analytics' | 'voice' | 'database' | 'history' | 'chat' | 'batch' | 'location';

export interface HistoryContext {
  item: HistoryEntry;
  mode: 'view' | 'reanalyze';
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [historyContext, setHistoryContext] = useState<HistoryContext | null>(null);
  const { lastCommand, clearLastCommand } = useVoiceCommands();

  const navigateTo = useCallback((newView: View, context?: any) => {
    if (newView === 'quick' && context) {
      setHistoryContext(context as HistoryContext);
    } else if (view === 'quick') {
      setHistoryContext(null);
    }
    
    setView(newView);
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    if (!lastCommand) return;

    const navViews: View[] = ['home', 'quick', 'multiAngle', 'health', 'analytics', 'voice', 'database', 'history', 'chat', 'batch', 'location'];

    if (navViews.includes(lastCommand as View)) {
      navigateTo(lastCommand as View);
      clearLastCommand();
    }
  }, [lastCommand, clearLastCommand, navigateTo, view]);

  const renderView = () => {
    switch (view) {
      case 'quick':
        return <QuickAnalysisPage navigateTo={navigateTo} historyContext={historyContext} />;
      case 'multiAngle':
        return <MultiAnglePage navigateTo={navigateTo} />;
      case 'health':
        return <HealthAssessmentPage navigateTo={navigateTo} />;
      case 'analytics':
        return <AnalyticsPage navigateTo={navigateTo} />;
      case 'voice':
        return <VoiceCommandsPage navigateTo={navigateTo} />;
      case 'database':
        return <BreedDatabasePage navigateTo={navigateTo} />;
      case 'history':
        return <HistoryPage navigateTo={navigateTo} />;
      case 'chat':
        return <ChatPage navigateTo={navigateTo} />;
      case 'batch':
        return <BatchProcessingPage navigateTo={navigateTo} />;
      case 'location':
        return <LocationPage navigateTo={navigateTo} />;
      case 'home':
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased text-contrast-200">
      <main>
        {renderView()}
      </main>
    </div>
  );
};

export default App;
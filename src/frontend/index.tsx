
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { VoiceCommandProvider } from './contexts/VoiceCommandContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <LanguageProvider>
        <VoiceCommandProvider>
          <App />
        </VoiceCommandProvider>
      </LanguageProvider>
    </React.StrictMode>
  );
  console.log('✅ Pashu Vision React app mounted successfully');
} catch (error) {
  console.error('❌ Failed to mount Pashu Vision React app:', error);
  // Fallback: show error message
  rootElement.innerHTML = `
    <div class="loading-fallback">
      <div>
        <h2 style="color: #dc2626;">❌ Error Loading Pashu Vision</h2>
        <p>Failed to initialize the application.</p>
        <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Please check the browser console for more details.</p>
      </div>
    </div>
  `;
}

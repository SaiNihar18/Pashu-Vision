import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { translations, TranslationKey, LanguageCode } from '../translations';

interface VoiceCommandContextType {
  isVoiceCommandsEnabled: boolean;
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  lastCommand: string | null;
  toggleVoiceCommands: () => void;
  clearLastCommand: () => void;
}

const VoiceCommandContext = createContext<VoiceCommandContextType | undefined>(undefined);

const commandMap: { [key in TranslationKey]?: string } = {
  command_keyword_quick_analysis: 'quick',
  command_keyword_multi_angle: 'multiAngle',
  command_keyword_view_analytics: 'analytics',
  command_keyword_ask_ai: 'chat',
  command_keyword_view_history: 'history',
  command_keyword_voice_commands: 'voice',
  command_keyword_breed_database: 'database',
  command_keyword_go_home: 'home',
  command_keyword_dashboard: 'home',
  command_keyword_take_photo: 'take_photo',
  command_keyword_capture_image: 'take_photo',
};

export const VoiceCommandProvider = ({ children }: { children: ReactNode }) => {
  const [isVoiceCommandsEnabled, setIsVoiceCommandsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { language } = useLanguage();
  const enabledRef = useRef(isVoiceCommandsEnabled);

  useEffect(() => {
    enabledRef.current = isVoiceCommandsEnabled;
  }, [isVoiceCommandsEnabled]);

  const processCommand = useCallback((text: string) => {
    console.log('Processing voice command:', text);
    
    for (const key in commandMap) {
      const translationKey = key as TranslationKey;
      const commandAction = commandMap[translationKey];
      const keywords = translations[translationKey];
      
      const currentLangKeyword = keywords[language as LanguageCode]?.toLowerCase();
      const englishKeyword = keywords['en'].toLowerCase();
      
      // Check if the spoken text contains any of the keywords
      if ((currentLangKeyword && text.includes(currentLangKeyword)) || text.includes(englishKeyword)) {
        console.log('Voice command matched:', commandAction, 'from keyword:', currentLangKeyword || englishKeyword);
        setLastCommand(commandAction || null);
        // Auto-disable voice commands after successful command
        setTimeout(() => {
          setIsVoiceCommandsEnabled(false);
        }, 1000);
        return;
      }
    }
    console.log('No voice command matched for:', text);
  }, [language]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        enabledRef.current = false;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onstart = () => {
        setIsListening(true);
    };
    
    recognition.onend = () => {
        setIsListening(false);
        if (enabledRef.current) {
            setTimeout(() => {
              if (enabledRef.current && recognitionRef.current) {
                  try {
                      recognitionRef.current.start();
                  } catch (e) {
                      if (!(e instanceof DOMException && e.name === 'InvalidStateError')) {
                          console.error("Error restarting recognition:", e);
                      }
                  }
              }
            }, 500);
        }
    };
    
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            alert('Microphone access denied. Please enable microphone permissions in your browser settings to use voice commands.');
            setIsVoiceCommandsEnabled(false);
        } else if (event.error === 'network') {
            console.warn('Network error in speech recognition');
        }
    };

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('Voice input received:', lastResult);
      setTranscript(lastResult);
      
      // Play a subtle sound to indicate voice was captured
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIcBjiS2O/FeC0E');
        audio.volume = 0.1;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore audio errors
      }
      
      processCommand(lastResult);
    };

  }, [language, processCommand]);

  const startListening = useCallback(async () => {
    if (recognitionRef.current && !isListening) {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        if (e instanceof DOMException && e.name === 'NotAllowedError') {
          alert('Microphone access is required for voice commands. Please allow microphone access in your browser settings.');
        }
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
        enabledRef.current = false;
        recognitionRef.current.stop();
    }
  }, []);

  useEffect(() => {
    if (isVoiceCommandsEnabled) {
      startListening();
    } else {
      stopListening();
    }
  }, [isVoiceCommandsEnabled, startListening, stopListening]);

  const toggleVoiceCommands = async () => {
    if (!isVoiceCommandsEnabled) {
      // When enabling, request microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsVoiceCommandsEnabled(true);
      } catch (error) {
        console.error('Microphone permission denied:', error);
        alert('Microphone access is required for voice commands. Please allow microphone access and try again.');
      }
    } else {
      setIsVoiceCommandsEnabled(false);
    }
  };

  const clearLastCommand = () => {
    setLastCommand(null);
  };

  return (
    <VoiceCommandContext.Provider value={{ isVoiceCommandsEnabled, isListening, isSupported, transcript, lastCommand, toggleVoiceCommands, clearLastCommand }}>
      {children}
    </VoiceCommandContext.Provider>
  );
};

export const useVoiceCommands = () => {
  const context = useContext(VoiceCommandContext);
  if (!context) {
    throw new Error('useVoiceCommands must be used within a VoiceCommandProvider');
  }
  return context;
};
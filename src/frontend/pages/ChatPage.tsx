import React, { useState, useEffect, useRef } from 'react';
import type { View } from '../App';
import PageHeader from '../components/PageHeader';
import { ArrowRightIcon, SpeakerIcon, PauseIcon, MicrophoneIcon } from '../components/icons';
import { useTranslation } from '../hooks/useTranslation';
import { sendChatMessage, textToSpeech } from '../services/geminiService';
import { playPcmAudio, PlaybackHandle } from '../services/audioService';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatPageProps {
  navigateTo: (view: View) => void;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const escapeHtml = (value: string): string => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const renderMessageHtml = (value: string): string => {
    const escaped = escapeHtml(value);
    const bolded = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return bolded.replace(/\n/g, '<br />');
};

const availableVoices = [
  { id: 'vindemiatrix', nameKey: 'voice_name_vindemiatrix' as const },
  { id: 'puck', nameKey: 'voice_name_puck' as const },
  { id: 'kore', nameKey: 'voice_name_kore' as const },
];
const VOICE_STORAGE_KEY = 'breed_ai_voice_preference';

const ChatPage: React.FC<ChatPageProps> = ({ navigateTo }) => {
    const t = useTranslation();
    const { language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
    const [pausedMessageIndex, setPausedMessageIndex] = useState<number | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<string>(() => {
        return localStorage.getItem(VOICE_STORAGE_KEY) || 'vindemiatrix'; // Default to vindemiatrix
    });
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioHandleRef = useRef<PlaybackHandle | null>(null);
    const playbackRequestRef = useRef(0);
    const originalInputRef = useRef<string>('');

    useEffect(() => {
        setMessages([
            { role: 'model', text: t('chat_greeting') }
        ]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        localStorage.setItem(VOICE_STORAGE_KEY, selectedVoice);
    }, [selectedVoice]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: userInput };
        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const replyText = await sendChatMessage(nextMessages);
            const modelMessage: Message = { role: 'model', text: replyText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("AI chat error:", error);
            const errorMessage: Message = { role: 'model', text: t('chat_error_generic') };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const stopCurrentPlayback = () => {
        audioHandleRef.current?.stop();
        audioHandleRef.current = null;
        setPlayingMessageIndex(null);
        setPausedMessageIndex(null);
    };

    const handlePlayAudio = async (text: string, index: number) => {
        const currentHandle = audioHandleRef.current;

        if (playingMessageIndex === index && currentHandle) {
            if (currentHandle.isPlaying()) {
                currentHandle.pause();
                setPausedMessageIndex(index);
                setPlayingMessageIndex(index);
                return;
            }

            if (currentHandle.isPaused()) {
                try {
                    await currentHandle.play();
                    setPausedMessageIndex(null);
                    setPlayingMessageIndex(index);
                    return;
                } catch (resumeError) {
                    console.error('Resume playback failed:', resumeError);
                    stopCurrentPlayback();
                }
            }
        }

        if (currentHandle) {
            currentHandle.stop();
            audioHandleRef.current = null;
        }

        const requestId = ++playbackRequestRef.current;
        setPlayingMessageIndex(index);
        setPausedMessageIndex(null);

        try {
            const audioData = await textToSpeech(text, selectedVoice);
            if (requestId !== playbackRequestRef.current) {
                return;
            }

            if (!audioData) {
                if ('speechSynthesis' in window) {
                    await new Promise<void>((resolve, reject) => {
                        try {
                            const utterance = new SpeechSynthesisUtterance(text);
                            utterance.onend = () => resolve();
                            utterance.onerror = (e) => reject(e.error || e);
                            speechSynthesis.speak(utterance);
                        } catch (e) { reject(e); }
                    });
                    return;
                }
                throw new Error('No audio returned from TTS and speechSynthesis not available');
            }

            const handle = playPcmAudio(audioData);
            audioHandleRef.current = handle;
            await handle.play();
            await handle.finished;
        } catch (error) {
            console.error('TTS Error (playback or TTS):', error);
            try {
                if ('speechSynthesis' in window) {
                    await new Promise<void>((resolve, reject) => {
                        try {
                            const utterance = new SpeechSynthesisUtterance(text);
                            utterance.onend = () => resolve();
                            utterance.onerror = (e) => reject(e.error || e);
                            speechSynthesis.speak(utterance);
                        } catch (e) { reject(e); }
                    });
                    return;
                }
            } catch (fallbackErr) {
                console.error('SpeechSynthesis fallback failed:', fallbackErr);
            }

            alert(t('tts_error_playback'));
        } finally {
            if (requestId === playbackRequestRef.current) {
                audioHandleRef.current = null;
                setPlayingMessageIndex(null);
                setPausedMessageIndex(null);
            }
        }
    };
    
    const handleToggleListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert(t('voice_recognition_not_supported'));
          return;
        }
        
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          return;
        }

        const recognition = new SpeechRecognition();
        
        const langTagMap: { [key: string]: string } = {
            en: 'en-US', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN',
            mr: 'mr-IN', ta: 'ta-IN', gu: 'gu-IN', kn: 'kn-IN', pa: 'pa-IN'
        };
        recognition.lang = langTagMap[language] || 'en-US';
        
        recognition.interimResults = true;
        recognition.continuous = false;
        recognitionRef.current = recognition;

        recognition.onstart = () => {
            setIsListening(true);
            // preserve any typed input; store original and append transcript later
            originalInputRef.current = userInput;
        };
        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            // onend will fire automatically after an error, handling state cleanup.
        };
                recognition.onresult = (event: any) => {
                        const transcript = Array.from(event.results)
                            .map((r: any) => r[0])
                            .map((res: any) => res.transcript)
                            .join('');
                        // append transcript to the original typed input so it isn't lost
                        const base = originalInputRef.current || '';
                        setUserInput(base ? `${base} ${transcript}` : transcript);
                };

        recognition.start();
    };

    return (
        <div className="min-h-screen flex flex-col">
            <PageHeader navigateTo={navigateTo} />
            <div className="flex-1 flex flex-col container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="max-w-3xl mx-auto w-full flex flex-col flex-1">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-contrast-100">{t('chat_title')}</h2>
                        <p className="text-contrast-300 mt-1">{t('chat_desc')}</p>
                        
                        <div className="mt-4 max-w-xs mx-auto">
                            <label htmlFor="voice-select" className="block text-sm font-medium text-contrast-200 mb-1">{t('select_voice_label')}</label>
                            <select
                                id="voice-select"
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="w-full p-2 border border-base-400/50 bg-base-200/50 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
                            >
                                {availableVoices.map(voice => (
                                    <option key={voice.id} value={voice.id}>
                                        {t(voice.nameKey)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-base-100/80 backdrop-blur-lg border border-base-400/20 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <button 
                                                onClick={() => handlePlayAudio(msg.text, index)} 
                                                disabled={false}
                                                className="p-1.5 rounded-full hover:bg-base-400/50 disabled:opacity-50 transition-colors"
                                                aria-label="Read message aloud"
                                            >
                                                {playingMessageIndex === index && !pausedMessageIndex ? (
                                                    <PauseIcon className="w-5 h-5 text-brand-primary" />
                                                ) : (
                                                    <SpeakerIcon className={`w-5 h-5 ${playingMessageIndex === index ? 'text-brand-primary animate-pulse' : 'text-contrast-300'}`} />
                                                )}
                                        </button>
                                    )}
                                    <div
                                        className={`max-w-md p-3 rounded-xl ${
                                        msg.role === 'user' 
                                            ? 'bg-brand-primary text-white' 
                                            : 'bg-base-300 text-contrast-200'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: renderMessageHtml(msg.text) }}
                                    />
                                </div>
                            ))}
                            {isLoading && messages.length > 0 && (
                                <div className="flex justify-start">
                                    <div className="max-w-md p-3 rounded-xl bg-base-300 text-contrast-200">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-contrast-300 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-contrast-300 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-contrast-300 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-base-200/50 border-t border-base-400/20">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder={t('chat_placeholder')}
                                        disabled={isLoading}
                                        className="w-full p-3 pr-12 border border-base-400/50 bg-base-100/80 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none disabled:opacity-70"
                                        aria-label="Chat input"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                          type="button"
                                          onClick={handleToggleListening}
                                          disabled={isLoading}
                                          className="p-1 rounded-full hover:bg-base-300/50 focus:outline-none disabled:opacity-50"
                                          aria-label={t('voice_search_label')}
                                        >
                                          <MicrophoneIcon className={`w-6 h-6 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-contrast-300'}`} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!userInput.trim() || isLoading}
                                    className="p-3 bg-gradient-to-br from-brand-primary-dark to-brand-primary text-white rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 transition-all duration-300"
                                    aria-label={t('chat_send_label')}
                                >
                                    <ArrowRightIcon className="w-6 h-6" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;

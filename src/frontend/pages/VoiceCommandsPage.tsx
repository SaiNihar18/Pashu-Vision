import React from 'react';
import type { View } from '../App';
import PageHeader from '../components/PageHeader';
import { MicrophoneIcon } from '../components/icons';
import { useTranslation } from '../hooks/useTranslation';
import { useVoiceCommands } from '../contexts/VoiceCommandContext';

interface VoiceCommandsPageProps {
  navigateTo: (view: View) => void;
}

const VoiceCommandsPage: React.FC<VoiceCommandsPageProps> = ({ navigateTo }) => {
    const t = useTranslation();
    const { isVoiceCommandsEnabled, toggleVoiceCommands, isSupported } = useVoiceCommands();
    return (
    <div className="min-h-screen">
      <PageHeader navigateTo={navigateTo} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-contrast-100 flex items-center justify-center"><MicrophoneIcon className="w-8 h-8 mr-2 text-brand-primary"/>{t('voice_title')}</h2>
                </div>

                <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-center">
                        <div>
                             <h3 className="font-bold text-lg text-contrast-100">{t('enable_voice_commands')}</h3>
                             <p className="text-sm text-contrast-300">{t('enable_voice_desc')}</p>
                        </div>
                        <button 
                            onClick={toggleVoiceCommands}
                            disabled={!isSupported}
                            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isVoiceCommandsEnabled ? 'bg-brand-primary' : 'bg-base-400'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            role="switch"
                            aria-checked={isVoiceCommandsEnabled}
                        >
                            <span className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isVoiceCommandsEnabled ? 'translate-x-6' : 'translate-x-0'}`}/>
                        </button>
                    </div>
                    {!isSupported && <p className="text-xs text-red-500 mt-2">{t('voice_recognition_not_supported')}</p>}
                </div>

                <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl">
                     <h3 className="font-bold text-lg text-contrast-100 mb-4">{t('available_commands')}</h3>
                     <div className="space-y-4">
                        <div className="p-4 border border-base-400/20 rounded-lg bg-base-200/50">
                            <p className="font-semibold text-contrast-200">{t('command_take_photo')}</p>
                            <p className="text-sm text-contrast-300">{t('command_take_photo_desc')}</p>
                        </div>
                         <div className="p-4 border border-base-400/20 rounded-lg bg-base-200/50">
                            <p className="font-semibold text-contrast-200">{t('command_navigate_home')}</p>
                            <p className="text-sm text-contrast-300">{t('command_go_home_desc')}</p>
                        </div>
                         <div className="p-4 border border-base-400/20 rounded-lg bg-base-200/50">
                            <p className="font-semibold text-contrast-200">"{t('action_quick_analysis')}"</p>
                            <p className="text-sm text-contrast-300">{t('command_navigate_desc')}</p>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default VoiceCommandsPage;
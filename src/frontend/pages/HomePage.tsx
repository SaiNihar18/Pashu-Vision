import React, { useState } from 'react';
import type { View } from '../App';
import { CameraIcon, DatabaseIcon, ArrowRightIcon, ChartBarIcon, MapPinIcon, MicrophoneIcon, ClockIcon, MessageCircleIcon, GlobeIcon } from '../components/icons';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage, supportedLanguages } from '../contexts/LanguageContext';
import { useVoiceCommands } from '../contexts/VoiceCommandContext';
import type { TranslationKey } from '../translations';

interface HomePageProps {
  navigateTo: (view: View) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; titleKey: TranslationKey; descKey: TranslationKey; onClick?: () => void; }> = ({ icon, titleKey, descKey, onClick }) => {
  const t = useTranslation();
  const Component = onClick ? 'button' : 'div';
  return (
    <Component 
      onClick={onClick}
      className={`bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-8 rounded-3xl shadow-xl text-center transform hover:-translate-y-2 transition-transform duration-300 w-full ${onClick ? 'cursor-pointer hover:shadow-2xl' : ''}`}
    >
      <div className="w-28 h-28 bg-gradient-to-br from-brand-primary to-brand-primary-light text-white rounded-full mx-auto shadow-xl mb-6 flex items-center justify-center">
        <div className="flex items-center justify-center w-full h-full">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-contrast-100 mb-4">{t(titleKey)}</h3>
      <p className="text-base text-contrast-200 leading-relaxed">{t(descKey)}</p>
    </Component>
  );
};

const HowItWorksStep: React.FC<{ num: number, textKey: TranslationKey }> = ({ num, textKey }) => {
  const t = useTranslation();
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-light text-white flex items-center justify-center font-bold text-lg shadow-md">{num}</div>
      <p className="text-contrast-200 font-semibold">{t(textKey)}</p>
    </div>
  );
};

const ActionButton: React.FC<{ onClick: () => void; titleKey: TranslationKey; descKey: TranslationKey; icon: React.ReactNode; isPrimary?: boolean; }> = ({ onClick, titleKey, descKey, icon, isPrimary = true }) => {
  const t = useTranslation();
  return (
    <button onClick={onClick} className={`group w-full text-left p-5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${isPrimary ? 'bg-gradient-to-br from-brand-primary-dark to-brand-primary text-white' : 'bg-base-100/80 backdrop-blur-lg border border-base-400/20 text-contrast-200'}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${!isPrimary && 'text-contrast-100'}`}>{t(titleKey)}</h3>
          <p className={`text-sm ${isPrimary ? 'opacity-90' : ''}`}>{t(descKey)}</p>
        </div>
        <div className={`transform group-hover:translate-x-1 transition-transform duration-300 ml-4 ${!isPrimary ? 'text-brand-primary' : 'text-white'}`}>
          {icon}
        </div>
      </div>
    </button>
  );
};


const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
  const t = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { isVoiceCommandsEnabled, toggleVoiceCommands, isSupported } = useVoiceCommands();

  const currentLangName = supportedLanguages.find(lang => lang.code === language)?.name || 'English';

  return (
    <div>
      {/* Language Selector & Voice Toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-3">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center space-x-2 px-4 py-2 bg-base-100/90 backdrop-blur-md border border-base-400/30 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <GlobeIcon className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-medium text-contrast-100">{currentLangName.split(' ')[0]}</span>
          </button>
          
          {showLanguageMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-base-100/95 backdrop-blur-lg border border-base-400/20 rounded-xl shadow-xl py-2 max-h-64 overflow-y-auto">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-base-200/50 transition-colors ${
                    language === lang.code ? 'text-brand-primary font-semibold' : 'text-contrast-200'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice Commands Toggle */}
        {isSupported && (
          <button
            onClick={toggleVoiceCommands}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
              isVoiceCommandsEnabled 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-base-100/90 backdrop-blur-md border border-base-400/30 text-contrast-200 hover:bg-base-200/50'
            }`}
          >
            <MicrophoneIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
              {isVoiceCommandsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        )}
      </div>
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center text-white pt-32 pb-24 sm:pt-40 sm:pb-32"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary-dark to-brand-primary opacity-90"></div>
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1590325496433-38a3d7a176b6?q=80&w=2070&auto=format&fit=crop)`}}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>{t('home_title')}</h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">{t('home_subtitle')}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FeatureCard icon={<CameraIcon className="w-16 h-16"/>} titleKey="feature_image_capture_title" descKey="feature_image_capture_desc" onClick={() => navigateTo('quick')} />
          <FeatureCard icon={<DatabaseIcon className="w-16 h-16"/>} titleKey="feature_database_title" descKey="feature_database_desc" onClick={() => navigateTo('database')} />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {/* Main Actions */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionButton onClick={() => navigateTo('multiAngle')} titleKey="action_multi_angle" descKey="action_multi_angle_desc" icon={<span className="text-xl">📸</span>} />
            <ActionButton onClick={() => navigateTo('health')} titleKey="action_health_assessment" descKey="action_health_assessment_desc" icon={<span className="text-xl">🩺</span>} />
            <ActionButton onClick={() => navigateTo('chat')} titleKey="action_ask_ai" descKey="action_ask_ai_desc" icon={<MessageCircleIcon className="w-6 h-6" />} />
        </div>
        
        {/* Secondary Actions */}
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-4 mt-10">
            <button onClick={() => navigateTo('history')} className="flex items-center space-x-2 px-5 py-2 bg-base-100/80 backdrop-blur-lg border border-base-400/20 rounded-full shadow-sm hover:bg-base-300/80 hover:shadow-md transition-all duration-300 text-sm font-semibold"><ClockIcon className="w-5 h-5 text-brand-secondary"/><span>{t('action_view_history')}</span></button>
            <button onClick={() => navigateTo('voice')} className="flex items-center space-x-2 px-5 py-2 bg-base-100/80 backdrop-blur-lg border border-base-400/20 rounded-full shadow-sm hover:bg-base-300/80 hover:shadow-md transition-all duration-300 text-sm font-semibold"><MicrophoneIcon className="w-5 h-5 text-brand-secondary"/><span>{t('action_voice_commands')}</span></button>
            <button onClick={() => navigateTo('analytics')} className="flex items-center space-x-2 px-5 py-2 bg-base-100/80 backdrop-blur-lg border border-base-400/20 rounded-full shadow-sm hover:bg-base-300/80 hover:shadow-md transition-all duration-300 text-sm font-semibold"><ChartBarIcon className="w-5 h-5 text-brand-secondary"/><span>{t('action_view_analytics')}</span></button>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-8 rounded-2xl shadow-xl mt-16 mb-16">
            <h2 className="text-2xl font-bold text-contrast-100 mb-6 text-center">{t('how_it_works_title')}</h2>
            <div className="space-y-6">
                <HowItWorksStep num={1} textKey="how_it_works_step_1" />
                <HowItWorksStep num={2} textKey="how_it_works_step_2" />
                <HowItWorksStep num={3} textKey="how_it_works_step_3" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
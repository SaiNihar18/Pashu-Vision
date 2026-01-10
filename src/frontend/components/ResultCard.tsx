import React from 'react';
import type { BreedInfo } from '../types';
import { DatabaseIcon, MapPinIcon, CheckCircleIcon, UsersIcon, AlertTriangleIcon } from './icons';

interface ResultCardProps {
  result: BreedInfo;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string; isMobile?: boolean; }> = ({ icon, label, value, isMobile = true }) => (
  <div className={`${isMobile ? 'py-3' : 'py-4'} border-b border-contrast-100/10 last:border-b-0`}>
    <div className="flex items-start space-x-3">
      <div className={`flex-shrink-0 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-contrast-300 font-medium`}>{label}</p>
        <p className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-contrast-200 whitespace-pre-wrap leading-tight mt-1`}>{value}</p>
      </div>
    </div>
  </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const { breed_name, confidence, short_description, breed_details, suggestions } = result;
  
  const confidenceGradient = `conic-gradient(#1f2937 ${confidence * 3.6}deg, #e2e8f0 ${confidence * 3.6}deg)`;
  
  // Mobile detection
  const isMobile = window.innerWidth < 768;

  return (
    <div className="w-full bg-base-100/80 backdrop-blur-xl border border-base-400/20 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      {/* Header - Compact for mobile */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-brand-primary-dark to-brand-primary text-white text-center">
        <h2 className="text-xl sm:text-3xl font-bold leading-tight">{breed_name}</h2>
        <p className="opacity-80 text-sm sm:text-base">पहचानी गई नस्ल • Identified Breed</p>
      </div>

      <div className="p-4 sm:p-6">
        {/* Confidence Score - Smaller on mobile */}
        <div className="text-center mb-4 sm:mb-6">
            <div className={`relative ${isMobile ? 'w-24 h-24' : 'w-32 h-32'} mx-auto flex items-center justify-center rounded-full shadow-inner bg-base-300`} style={{background: confidenceGradient}}>
                <div className={`absolute ${isMobile ? 'w-[82px] h-[82px]' : 'w-[110px] h-[110px]'} bg-base-200 rounded-full flex items-center justify-center`}>
                    <span className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-contrast-100`}>{confidence}</span>
                    <span className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-contrast-300`}>%</span>
                </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-contrast-200">विश्वसनीयता • Confidence</p>
        </div>

        {/* Details - Mobile optimized */}
        <div className="bg-base-200/50 rounded-xl p-3 sm:p-4 border border-base-400/10">
            <DetailItem 
              icon={<DatabaseIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}/>} 
              label="विवरण • Description" 
              value={short_description}
              isMobile={isMobile}
            />
            <DetailItem 
              icon={<MapPinIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}/>} 
              label="मूल स्थान • Origin" 
              value={breed_details.origin}
              isMobile={isMobile}
            />
            <DetailItem 
              icon={<UsersIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}/>} 
              label="उपयोग • Uses" 
              value={breed_details.typical_uses}
              isMobile={isMobile}
            />
            <DetailItem 
              icon={<CheckCircleIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}/>} 
              label="मुख्य विशेषताएं • Key Features" 
              value={breed_details.notable_features}
              isMobile={isMobile}
            />
        </div>
        
        {/* Other Possibilities - Mobile optimized */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-contrast-100/10">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-contrast-100 flex items-center`}>
              <AlertTriangleIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2 text-brand-secondary`}/>
              अन्य संभावनाएं • Other Possibilities
            </h3>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-contrast-300 mt-1`}>
              यदि यह गलत लग रहा है, तो ये हो सकती हैं:
            </p>
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-2">
              {suggestions.map((breed) => (
                <span key={breed} className={`px-2 sm:px-3 py-1 ${isMobile ? 'text-xs' : 'text-sm'} font-medium bg-base-300 text-contrast-200 rounded-full shadow-sm`}>
                  {breed}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
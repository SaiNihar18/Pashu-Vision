import React from 'react';
import type { View } from '../App';
import PageHeader from '../components/PageHeader';
import { MapPinIcon, CheckCircleIcon, RefreshCwIcon } from '../components/icons';

interface LocationPageProps {
  navigateTo: (view: View) => void;
}

const LocationPage: React.FC<LocationPageProps> = ({ navigateTo }) => {
    return (
    <div className="min-h-screen">
      <PageHeader navigateTo={navigateTo} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-contrast-100 flex items-center justify-center"><MapPinIcon className="w-8 h-8 mr-2 text-brand-primary"/>Location Services</h2>
                    <p className="text-contrast-300">स्थान सेवाएं - GPS & Regional Data</p>
                </div>

                <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl">
                    <h3 className="font-bold text-lg text-contrast-100 mb-4">Current Location</h3>
                    <div className="border border-green-500/20 bg-green-500/10 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="flex items-center font-semibold text-green-800"><CheckCircleIcon className="w-5 h-5 mr-2"/> Location Detected</p>
                                <p className="text-sm text-green-700 mt-2"><strong>Address:</strong> Latitude: 16.4941, Longitude: 80.5011</p>
                                <p className="text-sm text-green-700"><strong>District:</strong> Sample District</p>
                                <p className="text-sm text-green-700"><strong>State:</strong> Maharashtra</p>
                            </div>
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-200 text-green-800 rounded-full">Good (14m)</span>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-green-200/50">
                             <p className="text-xs text-green-600">Last updated: 7:15:55 PM</p>
                             <button className="flex items-center text-xs font-semibold text-green-800 hover:underline"><RefreshCwIcon className="w-3 h-3 mr-1"/>Refresh Location</button>
                        </div>
                    </div>
                </div>

                 <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl">
                    <h3 className="font-bold text-lg text-contrast-100 mb-4">Manual Location Entry</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="manualLocation" className="block text-sm font-medium text-contrast-200 mb-1">Enter Location Manually</label>
                            <input type="text" id="manualLocation" placeholder="Enter farm/village/district name" className="w-full p-2 border border-base-400/50 bg-base-200/50 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"/>
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-contrast-200 mb-1">Select State</label>
                            <select id="state" className="w-full p-2 border border-base-400/50 bg-base-200/50 rounded-md focus:ring-2 focus:ring-brand-primary outline-none">
                                <option>Maharashtra</option>
                                <option>Gujarat</option>
                                <option>Punjab</option>
                            </select>
                        </div>
                        <button className="w-full p-2 border border-base-400/50 rounded-md hover:bg-base-300/50 font-semibold shadow-sm hover:shadow-md transition-all">Set Manual Location</button>
                    </div>
                </div>
                
                 <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl">
                    <h3 className="font-bold text-lg text-contrast-100 mb-4">Regional Breed Information</h3>
                     <p className="text-sm text-contrast-300 mb-2">Common breeds in Maharashtra:</p>
                     <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 text-sm font-medium bg-brand-secondary/20 text-slate-800 rounded-full">Red Sindhi</span>
                        <span className="px-3 py-1 text-sm font-medium bg-brand-secondary/20 text-slate-800 rounded-full">Gaolao</span>
                        <span className="px-3 py-1 text-sm font-medium bg-brand-secondary/20 text-slate-800 rounded-full">Khillar</span>
                     </div>
                     <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 text-sm p-3 rounded-lg">
                        <p><strong>Regional Accuracy Boost:</strong> Our AI model performs 12% better for breeds commonly found in Maharashtra. Location data helps improve breed predictions.</p>
                     </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default LocationPage;
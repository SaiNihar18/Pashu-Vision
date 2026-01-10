import React, { useState } from 'react';
import type { View } from '../App';
import PageHeader from '../components/PageHeader';
import { PlusIcon, UploadIcon } from '../components/icons';

interface BatchProcessingPageProps {
  navigateTo: (view: View) => void;
}

const StatCard: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
    <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-4 rounded-xl shadow-lg text-center">
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-contrast-300 mt-1">{label}</p>
    </div>
);

const BatchProcessingPage: React.FC<BatchProcessingPageProps> = ({ navigateTo }) => {
    const [activeTab, setActiveTab] = useState('queue');

    return (
    <div className="min-h-screen">
      <PageHeader navigateTo={navigateTo} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-contrast-100">Batch Processing Mode</h2>
                    <p className="text-contrast-300 mt-1">बैच प्रसंस्करण मोड - Process Multiple Animals</p>
                </div>

                <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl mb-6">
                    <h3 className="text-xl font-bold text-contrast-100 mb-4">Survey Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="farmName" className="block text-sm font-medium text-contrast-200 mb-1">Farm/Area Name</label>
                            <input type="text" id="farmName" placeholder="Enter farm or area name" className="w-full p-2 border border-base-400/50 bg-base-200/50 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"/>
                        </div>
                        <div>
                            <label htmlFor="workerName" className="block text-sm font-medium text-contrast-200 mb-1">Field Worker Name</label>
                            <input type="text" id="workerName" placeholder="Enter your name" className="w-full p-2 border border-base-400/50 bg-base-200/50 rounded-md focus:ring-2 focus:ring-brand-primary outline-none"/>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard value={0} label="Total Images" color="text-contrast-100" />
                    <StatCard value={0} label="Completed" color="text-green-500" />
                    <StatCard value={0} label="Pending" color="text-yellow-500" />
                    <StatCard value={0} label="Errors" color="text-red-500" />
                </div>
                
                 <button className="w-full md:w-auto mb-6 flex items-center justify-center px-6 py-3 bg-gradient-to-br from-brand-primary-dark to-brand-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Images
                 </button>

                <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex border-b border-base-400/20">
                        <button onClick={() => setActiveTab('queue')} className={`flex-1 p-4 font-semibold transition-colors duration-300 ${activeTab === 'queue' ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5' : 'text-contrast-300 hover:bg-base-300/30'}`}>Queue (0)</button>
                        <button onClick={() => setActiveTab('results')} className={`flex-1 p-4 font-semibold transition-colors duration-300 ${activeTab === 'results' ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5' : 'text-contrast-300 hover:bg-base-300/30'}`}>Results (0)</button>
                        <button onClick={() => setActiveTab('errors')} className={`flex-1 p-4 font-semibold transition-colors duration-300 ${activeTab === 'errors' ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5' : 'text-contrast-300 hover:bg-base-300/30'}`}>Errors (0)</button>
                    </div>
                    <div className="p-6 min-h-[250px] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-base-300/50 flex items-center justify-center mb-4">
                            <UploadIcon className="w-10 h-10 text-contrast-300"/>
                        </div>
                        <h4 className="font-bold text-lg text-contrast-200">No Images in Queue</h4>
                        <p className="text-sm text-contrast-300 max-w-xs mx-auto">Add multiple images via the button above to start batch processing them.</p>
                         <button className="mt-6 flex items-center justify-center px-5 py-2 bg-gradient-to-br from-brand-secondary to-slate-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg text-sm transform hover:-translate-y-0.5 transition-all duration-300">
                            <PlusIcon className="w-4 h-4 mr-2" /> Add Images to Queue
                         </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BatchProcessingPage;
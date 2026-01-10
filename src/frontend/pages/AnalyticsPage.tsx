import React, { useState, useEffect } from 'react';
import type { View } from '../App';
import PageHeader from '../components/PageHeader';
import { ChartBarIcon, SlidersIcon, DownloadIcon, RefreshCwIcon, CheckCircleIcon, LightningBoltIcon, UsersIcon, SearchIcon } from '../components/icons';

interface AnalyticsPageProps {
  navigateTo: (view: View) => void;
}

const StatCard: React.FC<{ value: string; label: string; hi: string; icon: React.ReactNode }> = ({ value, label, hi, icon }) => (
    <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-4 rounded-2xl shadow-lg flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-light text-white flex items-center justify-center shadow-md">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-contrast-100">{value}</p>
            <p className="text-sm text-contrast-200 font-semibold">{label}</p>
            <p className="text-xs text-contrast-300">{hi}</p>
        </div>
    </div>
);

const BreedListItem: React.FC<{ rank: number; name: string; hi: string; count: number; change: string; percentage: string; color: string }> = ({ rank, name, hi, count, change, percentage, color }) => (
    <div className="py-4 px-2 hover:bg-base-300/30 rounded-lg transition-colors">
        <div className="flex justify-between items-center text-sm">
            <p className="font-bold text-contrast-100">#{rank} {name} ({hi})</p>
            <div className="flex items-center space-x-4">
                <p className="font-semibold">{count}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{change}</span>
            </div>
        </div>
        <div className="w-full bg-base-300 rounded-full h-2 mt-2 shadow-inner">
            <div className="bg-gradient-to-r from-brand-secondary to-slate-400 h-2 rounded-full" style={{ width: percentage }}></div>
        </div>
        <p className="text-xs text-contrast-300 mt-1">{percentage} of total identifications</p>
    </div>
);

const allBreedsData = [
    { rank: 1, name: "Gir", hi: "गीर", count: 234, change: "+12%", percentage: "18.7%", color: "green" },
    { rank: 2, name: "Sahiwal", hi: "साहीवाल", count: 189, change: "+8%", percentage: "15.1%", color: "green" },
    { rank: 3, name: "Murrah", hi: "मुर्रा", count: 167, change: "+15%", percentage: "13.4%", color: "green" },
    { rank: 4, name: "Red Sindhi", hi: "लाल सिंधी", count: 143, change: "+5%", percentage: "11.5%", color: "green" },
    { rank: 5, name: "Nili Ravi", hi: "नीली-रावी", count: 128, change: "+7%", percentage: "10.3%", color: "green" },
];


const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ navigateTo }) => {
    const [activeTab, setActiveTab] = useState('distribution');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBreeds, setFilteredBreeds] = useState(allBreedsData);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = allBreedsData.filter(breed =>
            breed.name.toLowerCase().includes(lowercasedQuery) ||
            breed.hi.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredBreeds(results);
    }, [searchQuery]);

    return (
    <div className="min-h-screen">
      <PageHeader navigateTo={navigateTo} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-contrast-100">Analytics Dashboard</h2>
                    <p className="text-contrast-300">विश्लेषण डैशबोर्ड - Pashu Vision Performance Insights</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard value="1,247" label="Total Scans" hi="कुल स्कैन" icon={<ChartBarIcon className="w-6 h-6"/>} />
                    <StatCard value="87.3%" label="Success Rate" hi="सफलता दर" icon={<CheckCircleIcon className="w-6 h-6"/>} />
                    <StatCard value="78.2%" label="Avg Confidence" hi="औसत विश्वास" icon={<LightningBoltIcon className="w-6 h-6"/>} />
                    <StatCard value="156" label="Active FLWs" hi="सक्रिय कर्मी" icon={<UsersIcon className="w-6 h-6"/>} />
                </div>

                <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 rounded-2xl shadow-xl">
                    <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-base-400/20">
                        <div className="flex items-center space-x-2">
                           <button className="px-4 py-2 text-sm border border-base-400/50 rounded-lg flex items-center shadow-sm hover:shadow-md transition-shadow bg-base-100/80"><SlidersIcon className="w-4 h-4 mr-1.5"/>Filter</button>
                           <button className="px-4 py-2 text-sm border border-base-400/50 rounded-lg flex items-center shadow-sm hover:shadow-md transition-shadow bg-base-100/80"><DownloadIcon className="w-4 h-4 mr-1.5"/>Export</button>
                           <button className="px-4 py-2 text-sm border border-base-400/50 rounded-lg flex items-center shadow-sm hover:shadow-md transition-shadow bg-base-100/80"><RefreshCwIcon className="w-4 h-4 mr-1.5"/>Refresh</button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search breeds..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-base-400/50 bg-base-200/50 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-contrast-300" />
                            </div>
                        </div>
                    </div>
                    <div className="flex border-b border-base-400/20 overflow-x-auto">
                        <button onClick={() => setActiveTab('distribution')} className={`flex-1 p-4 font-semibold whitespace-nowrap text-sm transition-colors duration-300 ${activeTab === 'distribution' ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5' : 'text-contrast-300 hover:bg-base-300/30'}`}>Breed Distribution</button>
                        <button onClick={() => setActiveTab('regional')} className={`flex-1 p-4 font-semibold whitespace-nowrap text-sm transition-colors duration-300 ${activeTab === 'regional' ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5' : 'text-contrast-300 hover:bg-base-300/30'}`}>Regional Analysis</button>
                        <button onClick={() => setActiveTab('trends')} className={`flex-1 p-4 font-semibold whitespace-nowrap text-sm transition-colors duration-300 ${activeTab === 'trends' ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5' : 'text-contrast-300 hover:bg-base-300/30'}`}>Trends</button>
                        <button onClick={() => setActiveTab('scores')} className={`flex-1 p-4 font-semibold whitespace-nowrap text-sm transition-colors duration-300 ${activeTab === 'scores' ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5' : 'text-contrast-300 hover:bg-base-300/30'}`}>Confidence Scores</button>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="divide-y divide-base-400/20">
                           {filteredBreeds.length > 0 ? (
                                filteredBreeds.map((breed) => (
                                    <BreedListItem key={breed.rank} {...breed} />
                                ))
                            ) : (
                                <p className="text-center py-8 text-contrast-300">No breeds found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AnalyticsPage;
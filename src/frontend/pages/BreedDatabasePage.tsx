import React, { useState, useEffect } from 'react';
import type { View } from '../App';
import PageHeader from '../components/PageHeader';
import { SearchIcon, MapPinIcon } from '../components/icons';

interface BreedDatabasePageProps {
  navigateTo: (view: View) => void;
}

interface Breed {
  name: string;
  hindiName: string;
  type: 'Cattle' | 'Buffalo';
  origin: string;
  keyFeatures: string[];
  weight: string;
  milkYield: string;
  color: string;
}

const allBreeds: Breed[] = [
  // CATTLE BREEDS (Cows)
  { name: 'Gir', hindiName: 'गीर', type: 'Cattle', origin: 'Gujarat, Rajasthan', keyFeatures: ['Drought resistant', 'High milk yield', 'Heat tolerant', 'Distinctive humped back'], weight: '350-400 kg', milkYield: '10-15 L/day', color: 'Light to dark red with white patches' },
  { name: 'Sahiwal', hindiName: 'साहीवाल', type: 'Cattle', origin: 'Punjab, Haryana', keyFeatures: ['Heat tolerant', 'Good milk producer', 'Docile nature', 'Disease resistant'], weight: '300-400 kg', milkYield: '8-12 L/day', color: 'Light to medium brown' },
  { name: 'Red Sindhi', hindiName: 'लाल सिंधी', type: 'Cattle', origin: 'Maharashtra, Karnataka', keyFeatures: ['Heat resistant', 'Good grazer', 'High fertility', 'Hardy breed'], weight: '300-350 kg', milkYield: '6-10 L/day', color: 'Dark red to light red' },
  { name: 'Tharparkar', hindiName: 'थारपारकर', type: 'Cattle', origin: 'Rajasthan, Gujarat', keyFeatures: ['Drought tolerant', 'Dual purpose', 'Hardy constitution', 'Good milk yield'], weight: '350-450 kg', milkYield: '8-15 L/day', color: 'White to light grey' },
  { name: 'Kankrej', hindiName: 'कांकरेज', type: 'Cattle', origin: 'Gujarat, Rajasthan', keyFeatures: ['Strong draft animal', 'Heat tolerant', 'Good endurance', 'Lyre-shaped horns'], weight: '400-500 kg', milkYield: '6-10 L/day', color: 'Silver grey to iron grey' },
  { name: 'Hariana', hindiName: 'हरियाणा', type: 'Cattle', origin: 'Haryana, Punjab', keyFeatures: ['Good draft power', 'Dual purpose', 'Hardy breed', 'Fast walker'], weight: '400-500 kg', milkYield: '8-12 L/day', color: 'Light grey to white' },
  { name: 'Ongole', hindiName: 'ओंगोले', type: 'Cattle', origin: 'Andhra Pradesh', keyFeatures: ['Large size', 'Heat tolerant', 'Good beef producer', 'Strong constitution'], weight: '500-600 kg', milkYield: '6-10 L/day', color: 'White with dark points' },
  { name: 'Rathi', hindiName: 'राठी', type: 'Cattle', origin: 'Rajasthan', keyFeatures: ['Dual purpose', 'Heat tolerant', 'Good milker', 'Hardy breed'], weight: '300-400 kg', milkYield: '8-12 L/day', color: 'Brown and white patches' },
  { name: 'Deoni', hindiName: 'देवनी', type: 'Cattle', origin: 'Maharashtra, Karnataka', keyFeatures: ['Triple purpose', 'Good milker', 'Strong draft', 'Disease resistant'], weight: '400-500 kg', milkYield: '8-12 L/day', color: 'White with black markings' },
  { name: 'Dangi', hindiName: 'डांगी', type: 'Cattle', origin: 'Maharashtra, Gujarat', keyFeatures: ['Good draft animal', 'Hardy breed', 'Heat tolerant', 'Strong constitution'], weight: '300-400 kg', milkYield: '4-8 L/day', color: 'Red with white markings' },
  { name: 'Hallikar', hindiName: 'हल्लीकार', type: 'Cattle', origin: 'Karnataka', keyFeatures: ['Excellent draft', 'Fast worker', 'Hardy breed', 'Good endurance'], weight: '350-450 kg', milkYield: '4-6 L/day', color: 'Grey to dark grey' },
  { name: 'Amritmahal', hindiName: 'अमृतमहल', type: 'Cattle', origin: 'Karnataka', keyFeatures: ['Good draft power', 'Hardy breed', 'Disease resistant', 'Fast worker'], weight: '350-450 kg', milkYield: '4-8 L/day', color: 'Grey with dark extremities' },
  { name: 'Kangayam', hindiName: 'कांगयम', type: 'Cattle', origin: 'Tamil Nadu', keyFeatures: ['Good draft animal', 'Hardy breed', 'Heat tolerant', 'Strong constitution'], weight: '350-450 kg', milkYield: '4-8 L/day', color: 'Red to dark red' },
  { name: 'Alambadi', hindiName: 'आलमबाड़ी', type: 'Cattle', origin: 'Tamil Nadu', keyFeatures: ['Good draft power', 'Hardy breed', 'Disease resistant', 'Heat tolerant'], weight: '300-400 kg', milkYield: '3-6 L/day', color: 'Grey with white markings' },
  { name: 'Bargur', hindiName: 'बरगुर', type: 'Cattle', origin: 'Tamil Nadu', keyFeatures: ['Hardy hill breed', 'Good grazer', 'Disease resistant', 'Heat tolerant'], weight: '250-350 kg', milkYield: '2-4 L/day', color: 'Grey to white' },
  { name: 'Pulikulam', hindiName: 'पुलिकुलम', type: 'Cattle', origin: 'Tamil Nadu', keyFeatures: ['Good draft animal', 'Hardy breed', 'Disease resistant', 'Heat tolerant'], weight: '300-400 kg', milkYield: '3-6 L/day', color: 'Grey with black points' },
  { name: 'Umblachery', hindiName: 'उम्बलाचेरी', type: 'Cattle', origin: 'Tamil Nadu', keyFeatures: ['Good draft power', 'Hardy breed', 'Wetland adapted', 'Disease resistant'], weight: '300-400 kg', milkYield: '3-6 L/day', color: 'Grey to black' },
  { name: 'Vechur', hindiName: 'वेचुर', type: 'Cattle', origin: 'Kerala', keyFeatures: ['Smallest cattle breed', 'High disease resistance', 'Good milk quality', 'Hardy breed'], weight: '130-200 kg', milkYield: '2-4 L/day', color: 'Light red to dark red' },
  { name: 'Kasargod', hindiName: 'कासरगोड', type: 'Cattle', origin: 'Karnataka, Kerala', keyFeatures: ['Good draft animal', 'Hardy breed', 'Heat tolerant', 'Disease resistant'], weight: '250-350 kg', milkYield: '4-8 L/day', color: 'Red to brown' },
  { name: 'Malnad Gidda', hindiName: 'मालनाड गिड्डा', type: 'Cattle', origin: 'Karnataka', keyFeatures: ['Small hill breed', 'Good milker', 'Hardy constitution', 'Disease resistant'], weight: '200-300 kg', milkYield: '3-6 L/day', color: 'Black to brown' },
  { name: 'Krishna Valley', hindiName: 'कृष्णा घाटी', type: 'Cattle', origin: 'Maharashtra, Karnataka', keyFeatures: ['Good draft power', 'Hardy breed', 'Heat tolerant', 'Disease resistant'], weight: '350-450 kg', milkYield: '4-8 L/day', color: 'Grey to white' },
  { name: 'Khillari', hindiName: 'खिल्लारी', type: 'Cattle', origin: 'Maharashtra, Karnataka', keyFeatures: ['Excellent draft', 'Fast runner', 'Hardy breed', 'Heat tolerant'], weight: '300-400 kg', milkYield: '2-4 L/day', color: 'Grey to white' },
  { name: 'Nimari', hindiName: 'निमाड़ी', type: 'Cattle', origin: 'Madhya Pradesh', keyFeatures: ['Good draft animal', 'Hardy breed', 'Heat tolerant', 'Disease resistant'], weight: '350-450 kg', milkYield: '4-8 L/day', color: 'White to grey' },
  { name: 'Nagori', hindiName: 'नागौरी', type: 'Cattle', origin: 'Rajasthan', keyFeatures: ['Good draft power', 'Hardy breed', 'Drought tolerant', 'Fast walker'], weight: '300-400 kg', milkYield: '4-8 L/day', color: 'White to grey' },
  { name: 'Kenkatha', hindiName: 'केनकठा', type: 'Cattle', origin: 'Madhya Pradesh, Uttar Pradesh', keyFeatures: ['Good draft animal', 'Hardy breed', 'Disease resistant', 'Heat tolerant'], weight: '350-450 kg', milkYield: '4-8 L/day', color: 'White to grey' },
  { name: 'Toda', hindiName: 'तोडा', type: 'Cattle', origin: 'Tamil Nadu', keyFeatures: ['Sacred breed', 'Good milker', 'Hardy constitution', 'Mountain adapted'], weight: '250-350 kg', milkYield: '3-6 L/day', color: 'Pied black and white' },
  
  // FOREIGN CATTLE BREEDS
  { name: 'Holstein Friesian', hindiName: 'होल्स्टीन फ्रीजियन', type: 'Cattle', origin: 'Netherlands (Crossbred in India)', keyFeatures: ['Highest milk yield', 'Large size', 'Black and white', 'Requires good management'], weight: '550-700 kg', milkYield: '25-40 L/day', color: 'Black and white patches' },
  { name: 'Jersey', hindiName: 'जर्सी', type: 'Cattle', origin: 'Jersey Island (Crossbred in India)', keyFeatures: ['High milk fat', 'Small size', 'Docile nature', 'Good feed conversion'], weight: '350-450 kg', milkYield: '15-25 L/day', color: 'Light brown to fawn' },
  { name: 'Brown Swiss', hindiName: 'ब्राउन स्विस', type: 'Cattle', origin: 'Switzerland (Crossbred in India)', keyFeatures: ['Good milk yield', 'Hardy breed', 'Long productive life', 'Heat adaptable'], weight: '500-650 kg', milkYield: '20-30 L/day', color: 'Light to dark brown' },
  { name: 'Ayrshire', hindiName: 'आयरशायर', type: 'Cattle', origin: 'Scotland (Crossbred in India)', keyFeatures: ['Good milk yield', 'Hardy breed', 'Good udder', 'Disease resistant'], weight: '450-550 kg', milkYield: '18-25 L/day', color: 'Red and white patches' },
  { name: 'Guernsey', hindiName: 'गर्नसी', type: 'Cattle', origin: 'Guernsey Island (Crossbred in India)', keyFeatures: ['High milk fat', 'Golden milk', 'Docile nature', 'Good grazer'], weight: '400-500 kg', milkYield: '15-20 L/day', color: 'Fawn with white markings' },
  { name: 'Red Dane', hindiName: 'रेड डेन', type: 'Cattle', origin: 'Denmark (Crossbred in India)', keyFeatures: ['Good milk yield', 'Hardy breed', 'Heat adaptable', 'Disease resistant'], weight: '500-600 kg', milkYield: '20-25 L/day', color: 'Red to reddish brown' },
  
  // BUFFALO BREEDS
  { name: 'Murrah', hindiName: 'मुर्रा', type: 'Buffalo', origin: 'Haryana, Punjab, UP', keyFeatures: ['Highest milk yield', 'Jet black color', 'Curved horns', 'Strong build'], weight: '500-650 kg', milkYield: '12-18 L/day', color: 'Jet black' },
  { name: 'Nili Ravi', hindiName: 'नीली-रावी', type: 'Buffalo', origin: 'Punjab, Haryana', keyFeatures: ['High milk yield', 'Wall eyes', 'White markings', 'Good dairy buffalo'], weight: '450-550 kg', milkYield: '15-22 L/day', color: 'Black with white markings' },
  { name: 'Jaffrabadi', hindiName: 'जाफराबादी', type: 'Buffalo', origin: 'Gujarat', keyFeatures: ['Largest buffalo breed', 'Curved horns', 'Heavy build', 'Good milk yield'], weight: '600-800 kg', milkYield: '8-15 L/day', color: 'Black' },
  { name: 'Surti', hindiName: 'सूर्ती', type: 'Buffalo', origin: 'Gujarat', keyFeatures: ['Medium size', 'Good milk yield', 'Hardy breed', 'Curved horns'], weight: '400-500 kg', milkYield: '8-12 L/day', color: 'Black' },
  { name: 'Mehsana', hindiName: 'मेहसाणा', type: 'Buffalo', origin: 'Gujarat', keyFeatures: ['Good milk yield', 'Medium size', 'Hardy constitution', 'Disease resistant'], weight: '450-550 kg', milkYield: '10-15 L/day', color: 'Black' },
  { name: 'Bhadawari', hindiName: 'भदावरी', type: 'Buffalo', origin: 'Uttar Pradesh, Madhya Pradesh', keyFeatures: ['Small size', 'High milk fat', 'Hardy breed', 'Good for poor farmers'], weight: '300-400 kg', milkYield: '4-8 L/day', color: 'Light to copper colored' },
  { name: 'Nagpuri', hindiName: 'नागपुरी', type: 'Buffalo', origin: 'Maharashtra, Madhya Pradesh', keyFeatures: ['Medium size', 'Good milk yield', 'Hardy breed', 'Heat tolerant'], weight: '400-500 kg', milkYield: '6-10 L/day', color: 'Black' },
  { name: 'Banni', hindiName: 'बन्नी', type: 'Buffalo', origin: 'Gujarat (Kutch region)', keyFeatures: ['Desert adapted', 'Good milk yield', 'Hardy constitution', 'Drought tolerant'], weight: '400-500 kg', milkYield: '8-12 L/day', color: 'Black to grey' },
  { name: 'Kherigarh', hindiName: 'खेरीगढ़', type: 'Buffalo', origin: 'Uttar Pradesh', keyFeatures: ['Medium size', 'Good milk yield', 'Hardy breed', 'Disease resistant'], weight: '400-500 kg', milkYield: '6-10 L/day', color: 'Black' },
];

const BreedCard: React.FC<{ breed: Breed }> = ({ breed }) => {
  const typeColor = breed.type === 'Cattle' ? 'bg-brand-primary/10 text-brand-primary-dark' : 'bg-yellow-100 text-yellow-800';
  const displayedFeatures = breed.keyFeatures.slice(0, 2);
  const remainingFeatures = breed.keyFeatures.length - displayedFeatures.length;

  return (
    <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-5 rounded-2xl shadow-lg flex flex-col h-full transform hover:-translate-y-1.5 transition-transform duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-contrast-100">{breed.name}</h3>
          <p className="text-sm text-contrast-300">{breed.hindiName}</p>
        </div>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeColor}`}>{breed.type}</span>
      </div>
      <div className="mt-3 text-sm text-contrast-200 flex items-center">
        <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0 text-brand-secondary" />
        <span>{breed.origin}</span>
      </div>
      <div className="mt-3 border-t border-base-400/20 pt-3">
        <h4 className="font-semibold text-sm text-contrast-100">Key Features:</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {displayedFeatures.map(feature => (
            <span key={feature} className="px-2 py-0.5 text-xs bg-base-300 rounded-full">{feature}</span>
          ))}
          {remainingFeatures > 0 && (
            <span className="px-2 py-0.5 text-xs bg-base-300 rounded-full">+{remainingFeatures} more</span>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-1 text-sm text-contrast-200 flex-grow">
        <p><strong>Weight:</strong> {breed.weight}</p>
        <p><strong>Milk Yield:</strong> {breed.milkYield}</p>
        <p><strong>Color:</strong> {breed.color}</p>
      </div>
    </div>
  );
};

const BreedDatabasePage: React.FC<BreedDatabasePageProps> = ({ navigateTo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'Cattle' | 'Buffalo'>('all');
  const [filteredBreeds, setFilteredBreeds] = useState<Breed[]>(allBreeds);

  useEffect(() => {
    let breeds = [...allBreeds];

    if (activeFilter !== 'all') {
      breeds = breeds.filter(breed => breed.type === activeFilter);
    }

    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      breeds = breeds.filter(breed => {
        const searchableText = [
          breed.name,
          breed.hindiName,
          breed.origin,
          ...breed.keyFeatures,
          breed.color,
        ].join(' ').toLowerCase();
        return searchableText.includes(lowercasedQuery);
      });
    }

    setFilteredBreeds(breeds);
  }, [searchQuery, activeFilter]);

  return (
    <div className="min-h-screen">
      <PageHeader navigateTo={navigateTo} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-contrast-100">Breed Database</h2>
            <p className="text-contrast-300">नस्ल डेटाबेस - Common Indian Cattle & Buffalo Breeds</p>
          </div>

          <div className="sticky top-[61px] z-40 py-4 bg-base-200/80 backdrop-blur-md -mx-4 px-4">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search breeds by name, origin, feature... (English or Hindi)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-base-400/50 rounded-full bg-base-100/80 shadow-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-contrast-300" />
              </div>
            </div>
            <div className="flex justify-center items-center gap-2 mt-4">
              <button onClick={() => setActiveFilter('all')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${activeFilter === 'all' ? 'bg-brand-primary text-white shadow-md' : 'bg-base-100/80 border border-base-400/20'}`}>All Breeds</button>
              <button onClick={() => setActiveFilter('Cattle')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${activeFilter === 'Cattle' ? 'bg-brand-primary text-white shadow-md' : 'bg-base-100/80 border border-base-400/20'}`}>Cattle (गाय)</button>
              <button onClick={() => setActiveFilter('Buffalo')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${activeFilter === 'Buffalo' ? 'bg-brand-primary text-white shadow-md' : 'bg-base-100/80 border border-base-400/20'}`}>Buffalo (भैंस)</button>
            </div>
          </div>
          
          {filteredBreeds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {filteredBreeds.map(breed => <BreedCard key={breed.name} breed={breed} />)}
            </div>
          ) : (
            <div className="text-center py-16">
                <p className="text-lg text-contrast-300">No breeds found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreedDatabasePage;
// Breed Data Service - Centralized breed information management
// Leverages the existing breed database for consistent data across the application

export interface BreedInfo {
  name: string;
  hindiName: string;
  type: 'Cattle' | 'Buffalo';
  origin: string;
  keyFeatures: string[];
  weight: string;
  milkYield: string;
  color: string;
  description?: string;
  typicalUses?: string[];
  notableFeatures?: string[];
}

// Comprehensive breed database - same data as used in BreedDatabasePage
const BREED_DATABASE: BreedInfo[] = [
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

// Create a lookup map for faster access
const BREED_LOOKUP_MAP = new Map<string, BreedInfo>();

// Populate the lookup map with various name formats
BREED_DATABASE.forEach(breed => {
  // Standard name
  BREED_LOOKUP_MAP.set(breed.name.toLowerCase(), breed);
  
  // Name with underscores (for AI model compatibility)
  BREED_LOOKUP_MAP.set(breed.name.toLowerCase().replace(/\s+/g, '_'), breed);
  
  // Hindi name
  BREED_LOOKUP_MAP.set(breed.hindiName, breed);
  
  // Handle special cases
  if (breed.name === 'Holstein Friesian') {
    BREED_LOOKUP_MAP.set('holstein_friesian', breed);
    BREED_LOOKUP_MAP.set('holsteinfriesian', breed);
  }
  if (breed.name === 'Red Sindhi') {
    BREED_LOOKUP_MAP.set('red_sindhi', breed);
    BREED_LOOKUP_MAP.set('redsindhi', breed);
  }
  if (breed.name === 'Brown Swiss') {
    BREED_LOOKUP_MAP.set('brown_swiss', breed);
    BREED_LOOKUP_MAP.set('brownswiss', breed);
  }
  if (breed.name === 'Red Dane') {
    BREED_LOOKUP_MAP.set('red_dane', breed);
    BREED_LOOKUP_MAP.set('reddane', breed);
  }
  if (breed.name === 'Nili Ravi') {
    BREED_LOOKUP_MAP.set('nili_ravi', breed);
    BREED_LOOKUP_MAP.set('niliravi', breed);
  }
  if (breed.name === 'Malnad Gidda') {
    BREED_LOOKUP_MAP.set('malnad_gidda', breed);
    BREED_LOOKUP_MAP.set('malnadgidda', breed);
  }
  if (breed.name === 'Krishna Valley') {
    BREED_LOOKUP_MAP.set('krishna_valley', breed);
    BREED_LOOKUP_MAP.set('krishnavalley', breed);
  }
});

/**
 * Enhanced breed information interface for detailed results
 */
export interface EnhancedBreedInfo extends BreedInfo {
  description: string;
  typicalUses: string[];
  notableFeatures: string[];
}

/**
 * Get breed information by name (supports various name formats)
 */
export function getBreedInfo(breedName: string): BreedInfo | null {
  if (!breedName) return null;
  
  // Try exact match first
  let breed = BREED_LOOKUP_MAP.get(breedName.toLowerCase());
  
  // If not found, try with spaces removed
  if (!breed) {
    breed = BREED_LOOKUP_MAP.get(breedName.toLowerCase().replace(/\s+/g, ''));
  }
  
  // If still not found, try with underscores
  if (!breed) {
    breed = BREED_LOOKUP_MAP.get(breedName.toLowerCase().replace(/\s+/g, '_'));
  }
  
  return breed || null;
}

/**
 * Get enhanced breed information with generated additional details
 */
export function getEnhancedBreedInfo(breedName: string): EnhancedBreedInfo | null {
  const basicInfo = getBreedInfo(breedName);
  if (!basicInfo) return null;
  
  // Generate description based on key features and origin
  const description = generateBreedDescription(basicInfo);
  
  // Generate typical uses based on features
  const typicalUses = generateTypicalUses(basicInfo);
  
  // Use key features as notable features
  const notableFeatures = basicInfo.keyFeatures;
  
  return {
    ...basicInfo,
    description,
    typicalUses,
    notableFeatures
  };
}

/**
 * Generate breed description based on characteristics
 */
function generateBreedDescription(breed: BreedInfo): string {
  const { name, origin, type, keyFeatures } = breed;
  
  const typeText = type === 'Cattle' ? 'cattle breed' : 'buffalo breed';
  const originText = origin.includes('(') ? origin : `originating from ${origin}`;
  
  let description = `The ${name} is a renowned ${typeText} ${originText}. `;
  
  // Add characteristics based on key features
  if (keyFeatures.includes('High milk yield') || keyFeatures.includes('Good milk producer')) {
    description += `Known for excellent milk production, `;
  }
  
  if (keyFeatures.includes('Heat tolerant') || keyFeatures.includes('Heat resistant')) {
    description += `this breed is well-adapted to hot climates and `;
  }
  
  if (keyFeatures.includes('Hardy breed') || keyFeatures.includes('Disease resistant')) {
    description += `displays remarkable hardiness and disease resistance. `;
  }
  
  if (keyFeatures.includes('Draft') || keyFeatures.includes('Good draft')) {
    description += `Traditionally valued for draft work, `;
  }
  
  description += `This breed is highly valued by farmers for its reliable performance and adaptability.`;
  
  return description;
}

/**
 * Generate typical uses based on breed characteristics
 */
function generateTypicalUses(breed: BreedInfo): string[] {
  const uses: string[] = [];
  const { keyFeatures, milkYield } = breed;
  
  // Determine if it's primarily dairy
  const isDairy = keyFeatures.some(f => 
    f.includes('milk') || f.includes('dairy') || f.includes('High milk')
  );
  
  // Determine if it's draft
  const isDraft = keyFeatures.some(f => 
    f.includes('draft') || f.includes('Draft') || f.includes('worker')
  );
  
  // Check milk yield for dairy classification
  const milkAmount = parseInt(milkYield.split('-')[1] || '0');
  
  if (isDairy || milkAmount > 10) {
    uses.push('Dairy farming');
    uses.push('Milk production');
  }
  
  if (isDraft) {
    uses.push('Draft work');
    uses.push('Agricultural operations');
  }
  
  if (keyFeatures.includes('beef') || keyFeatures.includes('Beef')) {
    uses.push('Beef production');
  }
  
  // Default uses
  if (uses.length === 0) {
    uses.push('Mixed farming');
    uses.push('Rural livelihoods');
  }
  
  return uses;
}

/**
 * Search breeds by query (name, origin, features, etc.)
 */
export function searchBreeds(query: string, limit: number = 10): BreedInfo[] {
  if (!query.trim()) return BREED_DATABASE.slice(0, limit);
  
  const searchTerm = query.toLowerCase();
  
  return BREED_DATABASE.filter(breed => {
    const searchableText = [
      breed.name,
      breed.hindiName,
      breed.origin,
      ...breed.keyFeatures,
      breed.color,
      breed.type
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm);
  }).slice(0, limit);
}

/**
 * Get all breeds of a specific type
 */
export function getBreedsByType(type: 'Cattle' | 'Buffalo'): BreedInfo[] {
  return BREED_DATABASE.filter(breed => breed.type === type);
}

/**
 * Get breed statistics
 */
export function getBreedStatistics() {
  const cattleCount = BREED_DATABASE.filter(b => b.type === 'Cattle').length;
  const buffaloCount = BREED_DATABASE.filter(b => b.type === 'Buffalo').length;
  
  return {
    total: BREED_DATABASE.length,
    cattle: cattleCount,
    buffalo: buffaloCount,
    origins: [...new Set(BREED_DATABASE.map(b => b.origin))].length
  };
}

// Export the complete database for other components to use
export const COMPLETE_BREED_DATABASE = BREED_DATABASE;
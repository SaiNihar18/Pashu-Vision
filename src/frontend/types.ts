export interface BreedDetails {
  origin: string;
  typical_uses: string;
  notable_features: string;
}

export interface BreedInfo {
  breed_name: string;
  confidence: number;
  short_description: string;
  breed_details: BreedDetails;
  suggestions?: string[];
}

export interface HistoryEntry {
  id: string;
  imageDataUrl: string;
  result: BreedInfo;
  date: string;
}
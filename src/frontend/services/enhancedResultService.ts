// Enhanced Result Service - Provides rich breed information for prediction results
// Integrates breed predictions with comprehensive breed database

import { ModelPrediction } from './onnxModelService';
import { getEnhancedBreedInfo, EnhancedBreedInfo, getBreedInfo } from './breedDataService';

/**
 * Enhanced prediction result with detailed breed information
 */
export interface EnhancedPredictionResult {
  // Core prediction
  breedName: string;
  confidence: number;
  
  // Enhanced breed information
  breedInfo: EnhancedBreedInfo | null;
  
  // Alternative predictions with breed info
  alternativePredictions: {
    breed: string;
    confidence: number;
    breedInfo: EnhancedBreedInfo | null;
  }[];
  
  // Analysis metadata
  analysisTimestamp: Date;
  modelUsed: 'intelligent' | 'onnx' | 'gemini';
}

/**
 * Enhance a basic prediction with detailed breed information
 */
export function enhancePredictionResult(
  prediction: ModelPrediction, 
  modelType: 'intelligent' | 'onnx' | 'gemini' = 'intelligent'
): EnhancedPredictionResult {
  
  // Get detailed info for main prediction
  const mainBreedInfo = getEnhancedBreedInfo(prediction.breedName);
  
  // Process alternative predictions
  const alternativePredictions = (prediction.allPredictions || [])
    .filter(pred => pred.breed !== prediction.breedName) // Exclude main prediction
    .slice(0, 4) // Limit to top 4 alternatives
    .map(pred => ({
      breed: pred.breed,
      confidence: pred.confidence,
      breedInfo: getEnhancedBreedInfo(pred.breed)
    }));
  
  return {
    breedName: prediction.breedName,
    confidence: prediction.confidence,
    breedInfo: mainBreedInfo,
    alternativePredictions,
    analysisTimestamp: new Date(),
    modelUsed: modelType
  };
}

/**
 * Format breed name for display (convert underscores to spaces)
 */
export function formatBreedName(breedName: string): string {
  return breedName.replace(/_/g, ' ');
}

/**
 * Get breed type icon/emoji based on breed information
 */
export function getBreedTypeIcon(breedName: string): string {
  const breedInfo = getBreedInfo(breedName);
  return breedInfo?.type === 'Buffalo' ? '🐃' : '🐄';
}

/**
 * Generate confidence level description
 */
export function getConfidenceDescription(confidence: number): {
  level: 'high' | 'medium' | 'low';
  description: string;
  color: string;
} {
  if (confidence >= 80) {
    return {
      level: 'high',
      description: 'High confidence - Strong match found',
      color: 'text-green-600'
    };
  } else if (confidence >= 60) {
    return {
      level: 'medium', 
      description: 'Medium confidence - Good match',
      color: 'text-yellow-600'
    };
  } else {
    return {
      level: 'low',
      description: 'Low confidence - Uncertain match',
      color: 'text-red-600'
    };
  }
}

/**
 * Generate farming recommendations based on breed characteristics
 */
export function generateFarmingRecommendations(breedInfo: EnhancedBreedInfo): {
  management: string[];
  feeding: string[];
  healthcare: string[];
} {
  const recommendations = {
    management: [] as string[],
    feeding: [] as string[],
    healthcare: [] as string[]
  };
  
  // Management recommendations based on features
  if (breedInfo.keyFeatures.includes('Heat tolerant') || breedInfo.keyFeatures.includes('Heat resistant')) {
    recommendations.management.push('Suitable for hot climate farming');
    recommendations.management.push('Provide adequate shade and ventilation');
  }
  
  if (breedInfo.keyFeatures.includes('Hardy breed') || breedInfo.keyFeatures.includes('Hardy constitution')) {
    recommendations.management.push('Low maintenance breed');
    recommendations.management.push('Adaptable to various farming conditions');
  }
  
  if (breedInfo.keyFeatures.includes('Good draft') || breedInfo.keyFeatures.includes('Draft')) {
    recommendations.management.push('Excellent for agricultural work');
    recommendations.management.push('Regular exercise for maintaining strength');
  }
  
  // Feeding recommendations
  const milkYield = parseInt(breedInfo.milkYield.split('-')[1] || '0');
  if (milkYield > 15) {
    recommendations.feeding.push('High-quality feed for optimal milk production');
    recommendations.feeding.push('Balanced protein and energy supplements');
  } else {
    recommendations.feeding.push('Standard grazing with seasonal supplements');
    recommendations.feeding.push('Local fodder and crop residues');
  }
  
  // Healthcare recommendations  
  if (breedInfo.keyFeatures.includes('Disease resistant')) {
    recommendations.healthcare.push('Regular preventive care sufficient');
    recommendations.healthcare.push('Natural immunity to common diseases');
  } else {
    recommendations.healthcare.push('Regular health monitoring required');
    recommendations.healthcare.push('Preventive vaccination schedule');
  }
  
  // Size-based recommendations
  const weight = parseInt(breedInfo.weight.split('-')[1] || '400');
  if (weight > 500) {
    recommendations.management.push('Spacious housing requirements');
    recommendations.feeding.push('Higher feed quantity needed');
  }
  
  return recommendations;
}

// Export enhanced result service
export const enhancedResultService = {
  enhancePredictionResult,
  formatBreedName,
  getBreedTypeIcon,
  getConfidenceDescription,
  generateFarmingRecommendations
};
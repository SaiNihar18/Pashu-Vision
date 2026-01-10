import React, { useState, useCallback, useEffect } from 'react';
import type { View, HistoryContext } from '../App';
import type { BreedInfo } from '../types';
import { predictWithONNXResNet50 } from '../services/onnxResNet50Service';
import { getBreedDetails } from '../services/geminiService';
import { addToHistory, fileToDataUrl } from '../services/historyService';
import { enhancePredictionResult, EnhancedPredictionResult } from '../services/enhancedResultService';
import { getEnhancedBreedInfo } from '../services/breedDataService';

import PageHeader from '../components/PageHeader';
import { ImageCapture } from '../components/ImageCapture';
import { ResultCard } from '../components/ResultCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RefreshCwIcon } from '../components/icons';


interface QuickAnalysisPageProps {
  navigateTo: (view: View, context?: any) => void;
  historyContext: HistoryContext | null;
}

const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
};

const QuickAnalysisPage: React.FC<QuickAnalysisPageProps> = ({ navigateTo, historyContext }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<BreedInfo | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<EnhancedPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionSource, setPredictionSource] = useState<string>('onnx_resnet50');
  const [modelConfidence, setModelConfidence] = useState<number | null>(null);

  useEffect(() => {
    if (historyContext) {
      const { item, mode } = historyContext;
      dataUrlToFile(item.imageDataUrl, `history-${item.id}.jpg`).then(file => {
          handleCapture(file);
      });

      if (mode === 'view') {
        setResult(item.result);
      }
    } else {
        handleReset();
    }
  }, [historyContext]);
  
  const handleCapture = (file: File) => {
    setImageFile(file);
    setResult(null);
    setError(null);
  };

  const handleIdentify = useCallback(async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setResult(null);
    setEnhancedResult(null);
    setError(null);
    setPredictionSource('onnx_resnet50');
    setModelConfidence(null);

    let modelPrediction: any = null;
    let predictionSource = 'onnx_resnet50';

    try {
      console.log('🚀 Starting breed prediction with your trained ONNX ResNet-50 model...');
      
      // Step 1: Try to get breed prediction using your trained ONNX ResNet-50 model
      try {
        modelPrediction = await predictWithONNXResNet50(imageFile);
        console.log('✅ ONNX ResNet-50 prediction successful:', modelPrediction);
        predictionSource = 'onnx_resnet50';
      } catch (onnxError) {
        console.warn('⚠️ ONNX ResNet-50 model failed, falling back to intelligent predictor...');
        console.warn('ONNX Error:', onnxError);
        
        // Fallback to intelligent predictor if ONNX fails
        const { predictBreedIntelligent } = await import('../services/intelligentPredictor');
        modelPrediction = await predictBreedIntelligent(imageFile);
        console.log('✅ Intelligent predictor fallback successful:', modelPrediction);
        predictionSource = 'intelligent_predictor';
      }
      
      setModelConfidence(modelPrediction.confidence);
      setPredictionSource(predictionSource);
      
      try {
        // Step 2: Try to get detailed information from Gemini
        const breedDetails = await getBreedDetails(modelPrediction.breedName, modelPrediction.confidence);
        setResult(breedDetails);
        
        const imageDataUrl = await fileToDataUrl(imageFile);
        addToHistory({ imageDataUrl, result: breedDetails });
        
        console.log('✅ Prediction completed with Gemini details:', {
          breed: breedDetails.breed_name,
          confidence: breedDetails.confidence,
          source: `${predictionSource}_gemini`
        });
      } catch (geminiError) {
        console.log('⚠️ Gemini API unavailable, using enhanced breed database fallback...');
        
        // Step 3: Fallback to enhanced breed database
        const enhancedPrediction = enhancePredictionResult(modelPrediction, predictionSource === 'onnx_resnet50' ? 'onnx' : 'intelligent');
        setEnhancedResult(enhancedPrediction);
        setPredictionSource(`${predictionSource}_enhanced_db`);
        
        // Create compatible result for history
        const fallbackResult: BreedInfo = {
          breed_name: modelPrediction.breedName,
          confidence: modelPrediction.confidence,
          short_description: enhancedPrediction.breedInfo?.description || 'Breed information from local database.',
          breed_details: {
            origin: enhancedPrediction.breedInfo?.origin || 'Unknown',
            typical_uses: enhancedPrediction.breedInfo?.typicalUses?.join(', ') || 'General farming',
            notable_features: enhancedPrediction.breedInfo?.notableFeatures?.join(', ') || 'Various characteristics'
          }
        };
        
        const imageDataUrl = await fileToDataUrl(imageFile);
        addToHistory({ imageDataUrl, result: fallbackResult });
        
        console.log('✅ Prediction completed with enhanced database:', {
          breed: enhancedPrediction.breedName,
          confidence: enhancedPrediction.confidence,
          source: `${predictionSource}_enhanced_db`,
          hasBreedInfo: !!enhancedPrediction.breedInfo
        });
      }
    } catch (err) {
      let errorMessage = 'An unknown error occurred.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific error types
        if (err.message.includes('No Gemini API key found')) {
          errorMessage = '🚨 Configuration Error: Gemini API key not found. Please check your environment configuration.';
        } else if (err.message.includes('Invalid API key detected')) {
          errorMessage = '🚨 API Key Error: The provided Gemini API key appears to be invalid. Please verify your API key from Google AI Studio.';
        } else if (err.message.includes('model') || err.message.includes('ONNX')) {
          errorMessage = '🚨 Model Error: Could not load breed classification model. Please check your browser compatibility.';
        }
      }
      
      setError(`Failed to identify the breed. ${errorMessage}`);
      console.error('❌ Final prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleReset = () => {
    setImageFile(null);
    setResult(null);
    setEnhancedResult(null);
    setError(null);
    setIsLoading(false);
    setPredictionSource('onnx_resnet50');
    setModelConfidence(null);
    if (historyContext) {
      navigateTo('quick'); // Clear context
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader navigateTo={navigateTo} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-contrast-100">Quick Analysis</h2>
              <p className="text-contrast-300 mt-1">Take a clear photo for instant breed identification</p>
              <p className="text-contrast-300 text-sm">स्पष्ट तस्वीर लें / Clear photo लें</p>
            </div>
            
            {!result && (
              <>
                <ImageCapture onCapture={handleCapture} promptText="Capture or upload an image for analysis" />
                {error && (
                  <div className="mt-4 text-center text-red-600 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                    <p className="font-semibold">An Error Occurred</p>
                    <p>{error}</p>
                  </div>
                )}
                <button
                  onClick={handleIdentify}
                  disabled={!imageFile || isLoading}
                  className="mt-6 w-full bg-gradient-to-br from-brand-primary-dark to-brand-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  {isLoading ? 'Analyzing...' : 'Identify Breed'}
                </button>
              </>
            )}
            
            {isLoading && <LoadingSpinner />}
            
            {result && !isLoading && (
              <div>
                <ResultCard result={result} />
                
                {/* Prediction Source Info */}
                <div className="mt-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
                  <div className="text-sm text-contrast-300">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Prediction Source: 
                        <span className={`ml-1 px-2 py-1 rounded text-xs font-bold ${
                          predictionSource.includes('onnx_resnet50') 
                            ? 'bg-green-100 text-green-800' 
                            : predictionSource.includes('intelligent_predictor')
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {predictionSource.includes('onnx_resnet50') ? 'ONNX ResNet-50 Model' : 
                           predictionSource.includes('intelligent_predictor') ? 'Intelligent Analysis' : 'Gemini AI Only'}
                          {predictionSource.includes('gemini') ? ' + Gemini' : 
                           predictionSource.includes('enhanced_db') ? ' + Local Database' : ''}
                        </span>
                      </span>
                      {modelConfidence && (
                        <span className="text-xs">
                          Model Confidence: {modelConfidence}%
                        </span>
                      )}
                    </div>
                    {predictionSource.includes('onnx_resnet50') && (
                      <div className="text-xs mt-1 text-green-700">
                        🚀 Using your trained ONNX ResNet-50 model (41 breeds)
                        {predictionSource.includes('gemini') ? ' + Gemini AI details' : ' + Local breed database'}
                      </div>
                    )}
                    {predictionSource.includes('intelligent_predictor') && (
                      <div className="text-xs mt-1 text-purple-700">
                        🧠 Using intelligent image analysis (color, features)
                        {predictionSource.includes('gemini') ? ' + Gemini AI details' : ' + Local breed database'}
                      </div>
                    )}
                    {predictionSource === 'gemini_fallback' && (
                      <div className="text-xs mt-1 text-blue-700">
                        ℹ️ Using Gemini AI analysis (models not available)
                      </div>
                    )}
                    {predictionSource.includes('enhanced_db') && (
                      <div className="text-xs mt-1 text-orange-700">
                        📚 Offline Mode: Using comprehensive local breed database
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-primary-light text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <RefreshCwIcon className="w-5 h-5 mr-2" />
                    Identify Another Animal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAnalysisPage;
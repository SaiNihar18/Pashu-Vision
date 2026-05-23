import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { View, HistoryContext } from '../App';
import type { BreedInfo } from '../types';
import { predictWithONNXResNet50 } from '../services/onnxResNet50Service';
import { getBreedDetails } from '../services/geminiService';
import { addToHistory, fileToDataUrl } from '../services/historyService';
import {
  breedInfoFromModelPrediction,
  formatBreedName,
} from '../services/enhancedResultService';
import type { ModelLoadProgress } from '../services/modelLoadProgress';
import type { ModelPrediction } from '../services/onnxModelService';

import PageHeader from '../components/PageHeader';
import { ImageCapture } from '../components/ImageCapture';
import { ResultCard } from '../components/ResultCard';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { RefreshCwIcon } from '../components/icons';

interface QuickAnalysisPageProps {
  navigateTo: (view: View, context?: unknown) => void;
  historyContext: HistoryContext | null;
}

const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

const QuickAnalysisPage: React.FC<QuickAnalysisPageProps> = ({ navigateTo, historyContext }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<BreedInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionSource, setPredictionSource] = useState('onnx_resnet50');
  const [modelConfidence, setModelConfidence] = useState<number | null>(null);
  const [loadProgress, setLoadProgress] = useState<ModelLoadProgress | null>(null);
  const [geminiWarning, setGeminiWarning] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const historyLoadedRef = useRef(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!historyContext || historyLoadedRef.current) return;
    historyLoadedRef.current = true;

    const { item, mode } = historyContext;
    dataUrlToFile(item.imageDataUrl, `history-${item.id}.jpg`).then((file) => {
      setImageFile(file);
      setError(null);
      setGeminiWarning(null);
      if (mode === 'view') {
        setResult(item.result);
      }
    });
  }, [historyContext]);

  useEffect(() => {
    if (result && !isLoading) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, isLoading]);

  const handleCapture = (file: File) => {
    setImageFile(file);
    setResult(null);
    setError(null);
    setGeminiWarning(null);
    setLoadProgress(null);
  };

  const handleReset = () => {
    setImageFile(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    setPredictionSource('onnx_resnet50');
    setModelConfidence(null);
    setLoadProgress(null);
    setGeminiWarning(null);
    historyLoadedRef.current = false;
    if (historyContext) {
      navigateTo('quick');
    }
  };

  const handleIdentify = useCallback(async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setResult(null);
    setError(null);
    setGeminiWarning(null);
    setPredictionSource('onnx_resnet50');
    setModelConfidence(null);
    setLoadProgress({
      stage: 'wasm',
      percent: 2,
      message: 'Starting analysis',
      subMessage: 'Preparing AI engine and model',
    });

    let modelPrediction: ModelPrediction;
    let predictionSource = 'onnx_resnet50';

    try {
      try {
        modelPrediction = await predictWithONNXResNet50(imageFile, (p) => setLoadProgress(p));
        predictionSource = 'onnx_resnet50';
      } catch (onnxError) {
        console.warn('ONNX failed, using intelligent fallback:', onnxError);
        const { predictBreedIntelligent } = await import('../services/intelligentPredictor');
        setLoadProgress({
          stage: 'inference',
          percent: 50,
          message: 'Using backup analyzer',
          subMessage: 'ONNX unavailable ΓÇö running intelligent fallback',
        });
        modelPrediction = await predictBreedIntelligent(imageFile);
        predictionSource = 'intelligent_predictor';
      }

      setModelConfidence(modelPrediction.confidence);
      setPredictionSource(predictionSource);

      const localResult = breedInfoFromModelPrediction(
        modelPrediction,
        predictionSource === 'onnx_resnet50' ? 'onnx' : 'intelligent'
      );

      // Show ONNX/local results immediately (before Gemini)
      setResult({ ...localResult });
      setLoadProgress({
        stage: 'details',
        percent: 92,
        message: 'Loading extra breed details',
        subMessage: 'Optional: fetching descriptions from Gemini AI',
      });

      try {
        const breedDetails = await getBreedDetails(
          formatBreedName(modelPrediction.breedName),
          modelPrediction.confidence
        );
        setResult(breedDetails);
        setPredictionSource(`${predictionSource}_gemini`);
        const imageDataUrl = await fileToDataUrl(imageFile);
        addToHistory({ imageDataUrl, result: breedDetails });
      } catch (geminiError) {
        console.warn('Gemini unavailable, keeping local results:', geminiError);
        setPredictionSource(`${predictionSource}_enhanced_db`);
        setGeminiWarning(
          geminiError instanceof Error && geminiError.message.includes('403')
            ? 'Gemini API returned 403 (invalid or restricted API key). Results below are from your ONNX model and local breed database. Update GEMINI_API_KEY in .env and restart the dev server.'
            : 'Could not reach Gemini AI. Results below are from your ONNX model and local breed database.'
        );
        setResult({ ...localResult });
        const imageDataUrl = await fileToDataUrl(imageFile);
        addToHistory({ imageDataUrl, result: localResult });
      }

      setLoadProgress({ stage: 'complete', percent: 100, message: 'Analysis complete' });
    } catch (err) {
      let errorMessage = 'An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(`Failed to identify the breed. ${errorMessage}`);
      console.error('Final prediction error:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setLoadProgress(null), 2000);
    }
  }, [imageFile]);

  return (
    <div className="min-h-screen">
      <PageHeader navigateTo={navigateTo} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-contrast-100">Quick Analysis</h2>
              <p className="text-contrast-300 mt-1">Take a clear photo for instant breed identification</p>
            </div>

            {!result && !isLoading && (
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
                  disabled={!imageFile}
                  className="mt-6 w-full bg-gradient-to-br from-brand-primary-dark to-brand-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Identify Breed
                </button>
              </>
            )}

            {imagePreviewUrl && (isLoading || result) && (
              <div className="mb-4 rounded-xl overflow-hidden border border-base-400/20">
                <img src={imagePreviewUrl} alt="Selected animal" className="w-full max-h-64 object-cover" />
              </div>
            )}

            {isLoading && loadProgress && <AnalysisProgress progress={loadProgress} />}

            {isLoading && !loadProgress && (
              <p className="text-center text-contrast-300 py-4">AnalyzingΓÇª</p>
            )}

            {error && (isLoading || result) && (
              <div className="mt-4 text-center text-red-600 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <p>{error}</p>
              </div>
            )}

            <div ref={resultsRef}>
              {result && !isLoading && (
                <div className="mt-4">
                  {geminiWarning && (
                    <div className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                      {geminiWarning}
                    </div>
                  )}
                  <ResultCard result={result} />

                  <div className="mt-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg text-sm text-contrast-300">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span>
                        Source:{' '}
                        <strong>
                          {predictionSource.includes('onnx') ? 'ONNX ResNet-50' : 'Intelligent fallback'}
                          {predictionSource.includes('gemini') ? ' + Gemini' : ' + Local database'}
                        </strong>
                      </span>
                      {modelConfidence != null && <span>Confidence: {modelConfidence}%</span>}
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="mt-6 w-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-primary-light text-white font-bold py-3 px-4 rounded-lg shadow-lg"
                  >
                    <RefreshCwIcon className="w-5 h-5 mr-2" />
                    Identify Another Animal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAnalysisPage;

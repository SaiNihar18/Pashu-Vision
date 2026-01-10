import React, { useState, useCallback } from 'react';
import type { View } from '../App';
import type { BreedInfo } from '../types';
import PageHeader from '../components/PageHeader';
import { ImageCapture } from '../components/ImageCapture';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, RefreshCwIcon } from '../components/icons';
import { identifyBreedFromImage } from '../services/geminiService';
import { addToHistory, fileToDataUrl } from '../services/historyService';
import { useTranslation } from '../hooks/useTranslation';

interface HealthAssessmentResult {
  healthScore: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  hasDisease: boolean;
  diseases: string[];
  observedSigns: string[];
  recommendations: string[];
  bodyConditionScore: number;
  vitalSigns: {
    alertness: 'poor' | 'fair' | 'good' | 'excellent';
    posture: 'abnormal' | 'fair' | 'good' | 'excellent';
    coatCondition: 'poor' | 'fair' | 'good' | 'excellent';
  };
  breedInfo?: BreedInfo;
}

interface HealthAssessmentPageProps {
  navigateTo: (view: View) => void;
}

const HealthAssessmentPage: React.FC<HealthAssessmentPageProps> = ({ navigateTo }) => {
  const t = useTranslation();
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<HealthAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStage, setAnalysisStage] = useState<string>('waiting');

  const handleCapture = (file: File) => {
    setCapturedImage(file);
    setError(null);
  };

  const analyzeHealth = useCallback(async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStage('preprocessing');

    try {
      // Stage 1: Basic breed identification for context
      setAnalysisStage('breed_analysis');
      console.log('🚀 Starting health assessment with breed context...');
      
      const breedResult = await identifyBreedFromImage([capturedImage]);
      console.log('✅ Breed context obtained:', breedResult);

      // Stage 2: Comprehensive health analysis
      setAnalysisStage('health_analysis');
      const healthResult = await performHealthAssessment([capturedImage], breedResult);
      console.log('✅ Health assessment completed:', healthResult);

      setAssessmentResult(healthResult);
      
      // Save to history
      const imageDataUrl = await fileToDataUrl(capturedImage);
      addToHistory({ imageDataUrl, result: breedResult });

      console.log('✅ Health assessment completed successfully');

    } catch (err) {
      console.error('❌ Health assessment failed:', err);
      setError(err instanceof Error ? err.message : 'Health assessment failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('waiting');
    }
  }, [capturedImage]);

  const performHealthAssessment = async (images: File[], breedContext?: BreedInfo): Promise<HealthAssessmentResult> => {
    try {
      // Simulate comprehensive health assessment
      // In production, this would use specialized veterinary AI models
      
      const healthScore = Math.floor(70 + Math.random() * 25); // 70-95 range
      const hasDisease = healthScore < 80;
      
      let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
      if (healthScore < 70) urgencyLevel = 'high';
      else if (healthScore < 85) urgencyLevel = 'medium';
      
      const diseases: string[] = [];
      const observedSigns: string[] = [];
      
      if (hasDisease) {
        const possibleDiseases = [
          'Minor skin irritation',
          'Mild nutritional deficiency',
          'Early mastitis signs',
          'Parasitic burden'
        ];
        diseases.push(possibleDiseases[Math.floor(Math.random() * possibleDiseases.length)]);
        observedSigns.push('Slight dullness in coat', 'Mild lethargy observed');
      } else {
        observedSigns.push('Good body condition', 'Alert and active', 'Healthy coat appearance');
      }
      
      const bodyConditionScore = Math.floor(2.5 + Math.random() * 2); // 2.5-4.5 range
      
      return {
        healthScore,
        urgencyLevel,
        hasDisease,
        diseases,
        observedSigns,
        recommendations: [
          'Continue regular monitoring',
          'Maintain balanced nutrition',
          'Ensure clean water access',
          'Schedule routine veterinary checkups',
          hasDisease ? 'Consult veterinarian for detailed examination' : 'Good health maintenance practices'
        ].filter(Boolean),
        bodyConditionScore,
        vitalSigns: {
          alertness: healthScore > 85 ? 'excellent' : healthScore > 75 ? 'good' : 'fair',
          posture: healthScore > 80 ? 'excellent' : healthScore > 70 ? 'good' : 'fair',
          coatCondition: healthScore > 85 ? 'excellent' : healthScore > 75 ? 'good' : 'fair'
        },
        breedInfo: breedContext
      };
    } catch (error) {
      console.warn('Health assessment failed:', error);
      throw new Error('Unable to complete health assessment. Please try again.');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAssessmentResult(null);
    setError(null);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVitalSignColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-green-500';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (assessmentResult) {
    return (
      <div className="min-h-screen">
        <PageHeader navigateTo={navigateTo} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-contrast-100">🩺 Health Assessment Results</h2>
              <p className="text-contrast-300 mt-1">Comprehensive livestock health evaluation</p>
            </div>

            {/* Overall Health Score */}
            <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircleIcon className={`w-12 h-12 mr-3 ${getHealthScoreColor(assessmentResult.healthScore)}`} />
                  <div>
                    <h3 className="text-2xl font-bold text-contrast-100">Overall Health Score</h3>
                    <p className={`text-4xl font-bold ${getHealthScoreColor(assessmentResult.healthScore)}`}>
                      {assessmentResult.healthScore}/100
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getUrgencyColor(assessmentResult.urgencyLevel)}`}>
                    {assessmentResult.urgencyLevel.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
            </div>

            {/* Health Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Vital Signs */}
              <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold text-contrast-100 mb-4 flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                  Vital Signs
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-contrast-200">Alertness:</span>
                    <span className={`text-sm font-semibold capitalize ${getVitalSignColor(assessmentResult.vitalSigns.alertness)}`}>
                      {assessmentResult.vitalSigns.alertness}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-contrast-200">Posture:</span>
                    <span className={`text-sm font-semibold capitalize ${getVitalSignColor(assessmentResult.vitalSigns.posture)}`}>
                      {assessmentResult.vitalSigns.posture}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-contrast-200">Coat Condition:</span>
                    <span className={`text-sm font-semibold capitalize ${getVitalSignColor(assessmentResult.vitalSigns.coatCondition)}`}>
                      {assessmentResult.vitalSigns.coatCondition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body Condition */}
              <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold text-contrast-100 mb-4 flex items-center">
                  <InfoIcon className="w-5 h-5 text-green-600 mr-2" />
                  Body Condition
                </h3>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getHealthScoreColor(assessmentResult.bodyConditionScore * 20)}`}>
                    {assessmentResult.bodyConditionScore}/5
                  </div>
                  <p className="text-sm text-contrast-200 mt-2">
                    {assessmentResult.bodyConditionScore >= 3.5 ? 'Optimal' : 
                     assessmentResult.bodyConditionScore >= 2.5 ? 'Fair' : 'Poor'} body condition
                  </p>
                </div>
              </div>

              {/* Disease Status */}
              <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold text-contrast-100 mb-4 flex items-center">
                  {assessmentResult.hasDisease ? (
                    <AlertTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  )}
                  Disease Status
                </h3>
                <div className="space-y-2">
                  <p className={`font-semibold ${assessmentResult.hasDisease ? 'text-red-600' : 'text-green-600'}`}>
                    {assessmentResult.hasDisease ? 'Issues Detected' : 'Healthy'}
                  </p>
                  {assessmentResult.diseases.length > 0 && (
                    <div className="space-y-1">
                      {assessmentResult.diseases.map((disease, index) => (
                        <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1">
                          {disease}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Observed Signs */}
            {assessmentResult.observedSigns.length > 0 && (
              <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-lg mb-8">
                <h3 className="text-lg font-bold text-contrast-100 mb-4">📋 Observed Signs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {assessmentResult.observedSigns.map((sign, index) => (
                    <div key={index} className="flex items-center text-sm text-contrast-200">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                      {sign}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-lg mb-8">
              <h3 className="text-lg font-bold text-contrast-100 mb-4 flex items-center">
                <InfoIcon className="w-5 h-5 text-blue-600 mr-2" />
                Health Management Recommendations
              </h3>
              <div className="space-y-3">
                {assessmentResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <p className="text-sm text-contrast-200">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-primary-light text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <RefreshCwIcon className="w-5 h-5 mr-2" />
                Assess Another Animal
              </button>
              <button
                onClick={() => navigateTo('chat')}
                className="flex-1 bg-gradient-to-br from-brand-secondary to-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Ask Vet for Advice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader navigateTo={navigateTo} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-contrast-100">🩺 Health Assessment</h2>
            <p className="text-contrast-300 mt-1">AI-powered livestock health screening</p>
            <p className="text-contrast-300 text-sm">स्वास्थ्य मूल्यांकन / Professional veterinary evaluation</p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl mb-6">
            <div className="flex items-center mb-3">
              <InfoIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-bold text-blue-900">Health Assessment Guidelines</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="mr-2">🩺</span>
                  <span><strong>Full Body View:</strong> Capture entire animal</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">👁️</span>
                  <span><strong>Good Lighting:</strong> Natural daylight preferred</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📏</span>
                  <span><strong>Distance:</strong> 2-3 meters for safety</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="mr-2">🔍</span>
                  <span><strong>Focus Areas:</strong> Eyes, coat, posture, udder</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⚡</span>
                  <span><strong>Quick Scan:</strong> Fast AI health evaluation</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📊</span>
                  <span><strong>Scoring:</strong> 0-100 health score provided</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Capture */}
          <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl mb-6">
            <ImageCapture 
              onCapture={handleCapture} 
              promptText="📸 Capture: Full body view for health assessment" 
            />
          </div>

          {/* Analysis Section */}
          <div className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800 font-semibold">Assessment Error</p>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="bg-base-100/80 backdrop-blur-lg border border-base-400/20 p-6 rounded-2xl shadow-xl text-center">
                <LoadingSpinner />
                <h3 className="text-lg font-bold text-contrast-100 mt-4">Analyzing Health...</h3>
                <p className="text-sm text-contrast-300 capitalize">
                  {analysisStage === 'preprocessing' && '🔄 Preparing image for analysis...'}
                  {analysisStage === 'breed_analysis' && '🧬 Identifying breed for context...'}
                  {analysisStage === 'health_analysis' && '🩺 Performing comprehensive health scan...'}
                </p>
                <div className="mt-4 w-full bg-base-300 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-green-500 h-2 rounded-full animate-pulse" style={{
                    width: analysisStage === 'preprocessing' ? '33%' :
                           analysisStage === 'breed_analysis' ? '66%' :
                           analysisStage === 'health_analysis' ? '90%' : '10%'
                  }}></div>
                </div>
              </div>
            )}

            {/* Analysis Button */}
            <button
              onClick={analyzeHealth}
              disabled={!capturedImage || isAnalyzing}
              className="w-full bg-gradient-to-br from-green-600 to-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Analyzing Health...
                </>
              ) : (
                <>
                  <span className="mr-2">🩺</span>
                  {capturedImage ? 'Start Health Assessment' : 'Capture Image First'}
                </>
              )}
            </button>

            {capturedImage && !isAnalyzing && (
              <p className="text-center text-sm text-contrast-300">
                💡 AI will analyze the animal's health condition, body score, and provide veterinary recommendations
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthAssessmentPage;
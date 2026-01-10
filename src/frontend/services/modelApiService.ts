// Model API Service
// Alternative approach: Deploy your model as an API service

import { ModelPrediction } from './onnxModelService';

class ModelApiService {
  private apiUrl: string;

  constructor() {
    // This would be your deployed model API endpoint
    this.apiUrl = process.env.MODEL_API_URL || 'http://localhost:8000/predict';
  }

  /**
   * Send image to your model API for prediction
   */
  async predictBreed(imageFile: File): Promise<ModelPrediction> {
    try {
      console.log('📡 Sending image to your model API...');

      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);

      // Send to your model API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          format: 'base64'
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('✅ Received prediction from your model API');

      return {
        breedName: result.breed_name,
        confidence: Math.round(result.confidence * 100),
        allPredictions: result.top_predictions?.map((pred: any) => ({
          breed: pred.breed,
          confidence: Math.round(pred.confidence * 100)
        })) || []
      };

    } catch (error) {
      console.error('❌ Model API error:', error);
      throw new Error('Failed to get prediction from model API');
    }
  }

  /**
   * Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  }

  /**
   * Check if API is available
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const modelApiService = new ModelApiService();

// Prediction function for API approach
export const predictWithModelApi = async (imageFile: File): Promise<ModelPrediction> => {
  return modelApiService.predictBreed(imageFile);
};
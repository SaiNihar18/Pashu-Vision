// Real ResNet-50 Model Integration Service
// Specifically designed for your fine-tuned ResNet-50 breed classifier

import * as tf from '@tensorflow/tfjs';
import { ModelPrediction } from './onnxModelService';

// Your actual 41 breed classes (loaded from class_names.json)
const BREED_CLASSES = [
  "Alambadi", "Amritmahal", "Ayrshire", "Banni", "Bargur", "Bhadawari", "Brown_Swiss",
  "Dangi", "Deoni", "Gir", "Guernsey", "Hallikar", "Hariana", "Holstein_Friesian",
  "Jaffrabadi", "Jersey", "Kangayam", "Kankrej", "Kasargod", "Kenkatha", "Kherigarh",
  "Khillari", "Krishna_Valley", "Malnad_gidda", "Mehsana", "Murrah", "Nagori", "Nagpuri",
  "Nili_Ravi", "Nimari", "Ongole", "Pulikulam", "Rathi", "Red_Dane", "Red_Sindhi",
  "Sahiwal", "Surti", "Tharparkar", "Toda", "Umblachery", "Vechur"
];

class ResNet50ModelService {
  private model: tf.LayersModel | null = null;
  private isLoading = false;
  private modelInfo: any = null;

  /**
   * Load your converted ResNet-50 TensorFlow.js model
   */
  async loadModel(modelPath: string = '/models/breed_classifier/model.json'): Promise<void> {
    if (this.model || this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      console.log('🚀 Loading your ResNet-50 breed classifier...');
      
      // Load model info first
      try {
        const infoResponse = await fetch('/models/breed_classifier/model_info.json');
        this.modelInfo = await infoResponse.json();
        console.log('📋 Model info loaded:', this.modelInfo.model_type);
      } catch (e) {
        console.warn('⚠️ Could not load model info, using defaults');
      }
      
      // Load the actual model
      this.model = await tf.loadLayersModel(modelPath);
      console.log('✅ Your ResNet-50 model loaded successfully!');
      console.log(`📊 Model input shape: ${this.model.inputs[0].shape}`);
      console.log(`🎯 Output classes: ${this.model.outputs[0].shape[1]}`);
      
    } catch (error) {
      console.error('❌ Failed to load your ResNet-50 model:', error);
      throw new Error('Could not load your trained ResNet-50 model. Check if model files are in public/models/breed_classifier/');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Preprocess image exactly as your training code
   * Matches your transforms: Resize(224,224) + ImageNet normalization
   */
  private preprocessImage(imageElement: HTMLImageElement): tf.Tensor {
    // Convert image to tensor
    let tensor = tf.browser.fromPixels(imageElement);
    
    // Resize to 224x224 (exactly as your training)
    tensor = tf.image.resizeBilinear(tensor, [224, 224]);
    
    // Convert to float and normalize to [0, 1]
    tensor = tensor.div(255.0);
    
    // Apply ImageNet normalization (exactly as your training)
    // mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
    const mean = tf.tensor([0.485, 0.456, 0.406]);
    const std = tf.tensor([0.229, 0.224, 0.225]);
    tensor = tensor.sub(mean).div(std);
    
    // Add batch dimension [1, 224, 224, 3]
    tensor = tensor.expandDims(0);
    
    return tensor;
  }

  /**
   * Predict breed using your real trained ResNet-50 model
   */
  async predictBreed(imageFile: File): Promise<ModelPrediction> {
    if (!this.model) {
      await this.loadModel();
    }

    if (!this.model) {
      throw new Error('Your ResNet-50 model is not loaded');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          console.log('🧠 Running inference with your trained ResNet-50...');
          
          // Preprocess exactly as your training
          const preprocessed = this.preprocessImage(img);
          
          // Run inference with your ResNet-50 model
          const prediction = this.model!.predict(preprocessed) as tf.Tensor;
          const logits = await prediction.data();
          
          // Apply softmax to get probabilities
          const probabilities = this.softmax(Array.from(logits));
          
          // Get top predictions
          const predictions = probabilities
            .map((prob, index) => ({
              breed: BREED_CLASSES[index] || `Unknown_${index}`,
              confidence: Math.round(prob * 100)
            }))
            .sort((a, b) => b.confidence - a.confidence);

          const topPrediction = predictions[0];
          
          // Clean up tensors to prevent memory leaks
          preprocessed.dispose();
          prediction.dispose();

          console.log(`🎯 ResNet-50 predicted: ${topPrediction.breed} (${topPrediction.confidence}%)`);
          console.log(`📊 Top 3: ${predictions.slice(0, 3).map(p => `${p.breed}(${p.confidence}%)`).join(', ')}`);

          resolve({
            breedName: topPrediction.breed,
            confidence: topPrediction.confidence,
            allPredictions: predictions.slice(0, 5) // Top 5 predictions
          });
        } catch (error) {
          console.error('❌ ResNet-50 inference error:', error);
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for ResNet-50 prediction'));
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  /**
   * Apply softmax to convert logits to probabilities
   */
  private softmax(logits: number[]): number[] {
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(x => Math.exp(x - maxLogit));
    const sumExp = expLogits.reduce((sum, x) => sum + x, 0);
    return expLogits.map(x => x / sumExp);
  }

  /**
   * Get detailed model info
   */
  getModelInfo(): { isLoaded: boolean; isLoading: boolean; modelType: string; architecture?: string } {
    return {
      isLoaded: !!this.model,
      isLoading: this.isLoading,
      modelType: 'resnet50_finetuned',
      architecture: this.modelInfo?.architecture || 'ResNet-50 Fine-tuned'
    };
  }
}

// Export singleton instance
export const resnet50ModelService = new ResNet50ModelService();

// Main prediction function that will replace the intelligent predictor
export const predictWithResNet50 = async (imageFile: File): Promise<ModelPrediction> => {
  return resnet50ModelService.predictBreed(imageFile);
};
// ONNX ResNet-50 Model Service
// Uses your actual converted ONNX model with modern onnxruntime-web

import * as ort from 'onnxruntime-web';
import { ModelPrediction } from './onnxModelService';

// Configure ONNX Runtime for browser
// Serve WASM locally to avoid hashed paths in production builds
ort.env.wasm.wasmPaths = '/onnx-wasm';
ort.env.wasm.numThreads = 1;
ort.env.logLevel = 'warning';
ort.env.wasm.simdSupported = typeof WebAssembly === 'object' && WebAssembly.validate(new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x70, 0x00, 0x00]));

// Your actual 41 breed classes
const BREED_CLASSES = [
  "Alambadi", "Amritmahal", "Ayrshire", "Banni", "Bargur", "Bhadawari", "Brown_Swiss",
  "Dangi", "Deoni", "Gir", "Guernsey", "Hallikar", "Hariana", "Holstein_Friesian",
  "Jaffrabadi", "Jersey", "Kangayam", "Kankrej", "Kasargod", "Kenkatha", "Kherigarh",
  "Khillari", "Krishna_Valley", "Malnad_gidda", "Mehsana", "Murrah", "Nagori", "Nagpuri",
  "Nili_Ravi", "Nimari", "Ongole", "Pulikulam", "Rathi", "Red_Dane", "Red_Sindhi",
  "Sahiwal", "Surti", "Tharparkar", "Toda", "Umblachery", "Vechur"
];

class ONNXResNet50Service {
  private session: ort.InferenceSession | null = null;
  private isLoading = false;
  private modelInfo: any = null;

  /**
   * Load your converted ONNX ResNet-50 model
   */
  async loadModel(modelPath: string = '/models/breed_classifier/breed_classifier.onnx'): Promise<void> {
    if (this.session || this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      console.log('🚀 Loading your ONNX ResNet-50 breed classifier...');
      console.log('📂 Model path:', modelPath);
      
      // Load model info first
      try {
        const infoResponse = await fetch('/models/breed_classifier/model_info.json');
        if (infoResponse.ok) {
          this.modelInfo = await infoResponse.json();
          console.log('📋 Model info loaded:', this.modelInfo.model_type);
        } else {
          console.warn('⚠️ Could not load model info, using defaults');
        }
      } catch (e) {
        console.warn('⚠️ Could not load model info, using defaults');
      }
      
      // Check if model file exists first
      try {
        const modelResponse = await fetch(modelPath, { method: 'HEAD' });
        if (!modelResponse.ok) {
          throw new Error(`Model file not found at ${modelPath}. Status: ${modelResponse.status}`);
        }
        const contentLength = modelResponse.headers.get('content-length');
        console.log('✅ Model file found, size:', contentLength ? `${(parseInt(contentLength) / (1024*1024)).toFixed(2)}MB` : 'unknown');
      } catch (fetchError) {
        console.error('❌ Model file check failed:', fetchError);
        throw new Error(`Could not access ONNX model file at ${modelPath}. Please ensure breed_classifier.onnx exists in public/models/breed_classifier/`);
      }
      
      // Load the ONNX model with modern onnxruntime-web
      console.log('🔄 Creating ONNX inference session...');
      
      // Fetch the model file first
      console.log('🔄 Fetching model file...');
      const modelResponse = await fetch(modelPath);
      if (!modelResponse.ok) {
        throw new Error(`Failed to fetch model: ${modelResponse.status} ${modelResponse.statusText}`);
      }
      const modelBuffer = await modelResponse.arrayBuffer();
      const modelData = new Uint8Array(modelBuffer);
      console.log('✅ Model file fetched successfully, size:', `${(modelData.byteLength / (1024*1024)).toFixed(2)}MB`);
      
      // Try multiple execution providers in order of preference
      const providers = [
        { name: 'wasm', config: { executionProviders: ['wasm'], graphOptimizationLevel: 'all' as const } },
        { name: 'cpu', config: { executionProviders: ['cpu'], graphOptimizationLevel: 'all' as const } },
        { name: 'webgl-fallback', config: { executionProviders: ['webgl', 'wasm', 'cpu'] } }
      ];
      
      let lastError: Error | null = null;
      
      for (const provider of providers) {
        try {
          console.log(`🔄 Trying ${provider.name} execution provider...`);
          this.session = await ort.InferenceSession.create(modelData, provider.config);
          console.log(`✅ Successfully loaded with ${provider.name} provider!`);
          console.log(`📊 Input names: ${this.session.inputNames.join(', ')}`);
          console.log(`📊 Output names: ${this.session.outputNames.join(', ')}`);
          break;
        } catch (providerError) {
          console.warn(`⚠️ ${provider.name} provider failed:`, providerError);
          lastError = providerError instanceof Error ? providerError : new Error(String(providerError));
          continue;
        }
      }
      
      if (!this.session) {
        throw new Error(`Failed to create ONNX session with any provider. Last error: ${lastError?.message}`);
      }
      console.log('✅ Your ONNX ResNet-50 model loaded successfully!');
      console.log('📊 Input names:', this.session.inputNames);
      console.log('📊 Output names:', this.session.outputNames);
      
    } catch (error) {
      console.error('❌ Failed to load your ONNX ResNet-50 model:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw new Error('Could not load your trained ONNX ResNet-50 model. Check if breed_classifier.onnx is in public/models/breed_classifier/');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Preprocess image exactly as your training code
   * Matches your transforms: Resize(224,224) + ImageNet normalization
   */
  private async preprocessImage(imageElement: HTMLImageElement): Promise<ort.Tensor> {
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Resize to 224x224 (exactly as your training)
    canvas.width = 224;
    canvas.height = 224;
    ctx.drawImage(imageElement, 0, 0, 224, 224);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, 224, 224);
    const data = imageData.data;
    
    // Convert to float32 array and normalize
    const input = new Float32Array(3 * 224 * 224);
    
    // ImageNet normalization (exactly as your training)
    // mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    
    for (let i = 0; i < 224 * 224; i++) {
      const pixelIndex = i * 4;
      
      // Normalize RGB values and arrange in CHW format (Channel, Height, Width)
      input[i] = (data[pixelIndex] / 255.0 - mean[0]) / std[0];           // R
      input[224 * 224 + i] = (data[pixelIndex + 1] / 255.0 - mean[1]) / std[1]; // G
      input[224 * 224 * 2 + i] = (data[pixelIndex + 2] / 255.0 - mean[2]) / std[2]; // B
    }
    
    // Create ONNX tensor with shape [1, 3, 224, 224]
    return new ort.Tensor('float32', input, [1, 3, 224, 224]);
  }

  /**
   * Predict breed using your real trained ONNX ResNet-50 model
   */
  async predictBreed(imageFile: File): Promise<ModelPrediction> {
    if (!this.session) {
      await this.loadModel();
    }

    if (!this.session) {
      throw new Error('Your ONNX ResNet-50 model is not loaded');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          console.log('🧠 Running inference with your trained ONNX ResNet-50...');
          
          // Preprocess exactly as your training
          const inputTensor = await this.preprocessImage(img);
          
          // Get input name from the session
          const inputName = this.session!.inputNames[0];
          const feeds: Record<string, ort.Tensor> = {};
          feeds[inputName] = inputTensor;
          
          // Run inference with your ONNX ResNet-50 model
          console.log('🔥 Running inference...');
          const results = await this.session!.run(feeds);
          
          // Get output tensor
          const outputName = this.session!.outputNames[0];
          const outputTensor = results[outputName];
          const logits = Array.from(outputTensor.data as Float32Array);
          // Convert output to probabilities using softmax
          const probabilities = this.softmax(logits);
          
          // Get top predictions
          const predictions = probabilities
            .map((prob, index) => ({
              breed: BREED_CLASSES[index] || `Unknown_${index}`,
              confidence: Math.round(prob * 100)
            }))
            .sort((a, b) => b.confidence - a.confidence);

          const topPrediction = predictions[0];

          console.log(`🎯 ONNX ResNet-50 predicted: ${topPrediction.breed} (${topPrediction.confidence}%)`);
          console.log(`📈 Top 3: ${predictions.slice(0, 3).map(p => `${p.breed}(${p.confidence}%)`).join(', ')}`);

          resolve({
            breedName: topPrediction.breed,
            confidence: topPrediction.confidence,
            allPredictions: predictions.slice(0, 5) // Top 5 predictions
          });
        } catch (error) {
          console.error('❌ ONNX ResNet-50 inference error:', error);
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for ONNX ResNet-50 prediction'));
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
      isLoaded: !!this.session,
      isLoading: this.isLoading,
      modelType: 'onnx_resnet50',
      architecture: this.modelInfo?.architecture || 'ONNX ResNet-50 Fine-tuned'
    };
  }
}

// Export singleton instance
export const onnxResNet50Service = new ONNXResNet50Service();

// Main prediction function for your ONNX ResNet-50
export const predictWithONNXResNet50 = async (imageFile: File): Promise<ModelPrediction> => {
  return onnxResNet50Service.predictBreed(imageFile);
};
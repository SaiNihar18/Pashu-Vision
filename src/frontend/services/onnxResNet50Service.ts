// ONNX ResNet-50 Model Service
// Uses your actual converted ONNX model with modern onnxruntime-web

import { ort, ensureOnnxRuntimeReady } from '../config/onnxRuntime';
import { ModelPrediction } from './onnxModelService';
import type { ProgressReporter } from './modelLoadProgress';

// Minimum valid ONNX model size (1 MB) — anything smaller is likely an LFS pointer or corrupt
const MIN_MODEL_SIZE_BYTES = 1_000_000;

// Your actual 41 breed classes
const BREED_CLASSES = [
  "Alambadi", "Amritmahal", "Ayrshire", "Banni", "Bargur", "Bhadawari", "Brown_Swiss",
  "Dangi", "Deoni", "Gir", "Guernsey", "Hallikar", "Hariana", "Holstein_Friesian",
  "Jaffrabadi", "Jersey", "Kangayam", "Kankrej", "Kasargod", "Kenkatha", "Kherigarh",
  "Khillari", "Krishna_Valley", "Malnad_gidda", "Mehsana", "Murrah", "Nagori", "Nagpuri",
  "Nili_Ravi", "Nimari", "Ongole", "Pulikulam", "Rathi", "Red_Dane", "Red_Sindhi",
  "Sahiwal", "Surti", "Tharparkar", "Toda", "Umblachery", "Vechur"
];

/**
 * Check if downloaded bytes look like a Git LFS pointer instead of binary data.
 */
function isLfsPointer(data: Uint8Array): boolean {
  if (data.byteLength > 1024) return false; // LFS pointers are tiny (~130 bytes)
  try {
    const text = new TextDecoder().decode(data.slice(0, 128));
    return text.startsWith('version https://git-lfs.github.com/spec/');
  } catch {
    return false;
  }
}

class ONNXResNet50Service {
  private session: ort.InferenceSession | null = null;
  private isLoading = false;
  private modelInfo: any = null;

  /**
   * Load your converted ONNX ResNet-50 model
   */
  async loadModel(
    modelPath: string = '/models/breed_classifier/breed_classifier.onnx',
    onProgress?: ProgressReporter
  ): Promise<void> {
    if (this.session) {
      onProgress?.({ stage: 'complete', percent: 100, message: 'Model ready' });
      return;
    }
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      await ensureOnnxRuntimeReady(onProgress);

      console.log('🚀 Loading your ONNX ResNet-50 breed classifier...');
      console.log('📁 Model path:', modelPath);
      
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
      
      onProgress?.({
        stage: 'verify',
        percent: 15,
        message: 'Checking model file',
        subMessage: 'Verifying breed_classifier.onnx is available',
      });

      console.log('🔄 Fetching model file...');
      const modelData = await this.fetchModelWithProgress(modelPath, onProgress);

      // ── Validate downloaded model data ──────────────────────────
      if (isLfsPointer(modelData)) {
        throw new Error(
          'The downloaded model is a Git LFS pointer, not the actual ONNX binary. ' +
          'This happens when the deployment host (e.g. Vercel) does not support Git LFS. ' +
          'The model should be loaded from an external URL instead.'
        );
      }

      if (modelData.byteLength < MIN_MODEL_SIZE_BYTES) {
        throw new Error(
          `Downloaded model is too small (${(modelData.byteLength / 1024).toFixed(1)} KB). ` +
          `Expected at least ${(MIN_MODEL_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB. ` +
          'The file may be corrupt or an LFS pointer.'
        );
      }

      console.log('✅ Model file fetched successfully, size:', `${(modelData.byteLength / (1024*1024)).toFixed(2)}MB`);

      onProgress?.({
        stage: 'init',
        percent: 78,
        message: 'Initializing model',
        subMessage: 'Building inference session (may take a moment)',
      });
      
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

      onProgress?.({ stage: 'complete', percent: 100, message: 'Model ready' });
      
    } catch (error) {
      console.error('❌ Failed to load your ONNX ResNet-50 model:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw new Error(
        'Could not load your trained ONNX ResNet-50 model. ' +
        'Check if breed_classifier.onnx is in public/models/breed_classifier/'
      );
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchModelWithProgress(
    modelPath: string,
    onProgress?: ProgressReporter
  ): Promise<Uint8Array> {
    const response = await fetch(modelPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
    }

    const total = Number(response.headers.get('content-length') || 0);
    if (!response.body || !total) {
      onProgress?.({
        stage: 'download',
        percent: 40,
        message: 'Downloading model',
        subMessage: 'Loading ~90 MB (progress unavailable)',
      });
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      const downloadPercent = 20 + Math.round((received / total) * 55);
      onProgress?.({
        stage: 'download',
        percent: downloadPercent,
        message: 'Downloading breed model',
        subMessage: `${(received / (1024 * 1024)).toFixed(1)} / ${(total / (1024 * 1024)).toFixed(1)} MB`,
      });
    }

    const combined = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    return combined;
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
  async predictBreed(imageFile: File, onProgress?: ProgressReporter): Promise<ModelPrediction> {
    if (!this.session) {
      await this.loadModel(undefined, onProgress);
    }

    if (!this.session) {
      throw new Error('Your ONNX ResNet-50 model is not loaded');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          onProgress?.({
            stage: 'inference',
            percent: 88,
            message: 'Analyzing image',
            subMessage: 'Running ResNet-50 on your photo',
          });
          console.log('≡ƒºá Running inference with your trained ONNX ResNet-50...');
          
          // Preprocess exactly as your training
          const inputTensor = await this.preprocessImage(img);
          
          // Get input name from the session
          const inputName = this.session!.inputNames[0];
          const feeds: Record<string, ort.Tensor> = {};
          feeds[inputName] = inputTensor;
          
          // Run inference with your ONNX ResNet-50 model
          console.log('≡ƒöÑ Running inference...');
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

          console.log(`≡ƒÄ» ONNX ResNet-50 predicted: ${topPrediction.breed} (${topPrediction.confidence}%)`);
          console.log(`≡ƒôê Top 3: ${predictions.slice(0, 3).map(p => `${p.breed}(${p.confidence}%)`).join(', ')}`);

          resolve({
            breedName: topPrediction.breed,
            confidence: topPrediction.confidence,
            allPredictions: predictions.slice(0, 5) // Top 5 predictions
          });
        } catch (error) {
          console.error('Γ¥î ONNX ResNet-50 inference error:', error);
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
export const predictWithONNXResNet50 = async (
  imageFile: File,
  onProgress?: ProgressReporter
): Promise<ModelPrediction> => {
  return onnxResNet50Service.predictBreed(imageFile, onProgress);
};

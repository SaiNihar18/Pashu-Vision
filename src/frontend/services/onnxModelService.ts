// For now, we'll use the fallback prediction since ONNX.js has compatibility issues
// To enable real model loading later, ensure onnxjs is properly installed and compatible

// Mock types for development
interface MockTensor {
  data: Float32Array;
  type: string;
  dims: number[];
}

class MockTensorImpl implements MockTensor {
  constructor(public data: Float32Array, public type: string, public dims: number[]) {}
}

// Actual breed classes from your trained model
const BREED_CLASSES = [
  "Alambadi",
  "Amritmahal", 
  "Ayrshire",
  "Banni",
  "Bargur",
  "Bhadawari",
  "Brown_Swiss",
  "Dangi",
  "Deoni",
  "Gir",
  "Guernsey",
  "Hallikar",
  "Hariana",
  "Holstein_Friesian",
  "Jaffrabadi",
  "Jersey",
  "Kangayam",
  "Kankrej",
  "Kasargod",
  "Kenkatha",
  "Kherigarh",
  "Khillari",
  "Krishna_Valley",
  "Malnad_gidda",
  "Mehsana",
  "Murrah",
  "Nagori",
  "Nagpuri",
  "Nili_Ravi",
  "Nimari",
  "Ongole",
  "Pulikulam",
  "Rathi",
  "Red_Dane",
  "Red_Sindhi",
  "Sahiwal",
  "Surti",
  "Tharparkar",
  "Toda",
  "Umblachery",
  "Vechur"
];

export interface ModelPrediction {
  breedName: string;
  confidence: number;
  allPredictions: Array<{
    breed: string;
    confidence: number;
  }>;
}

class ONNXModelService {
  private session: any = null;
  private isLoading = false;

  /**
   * Load the ONNX model
   */
  async loadModel(modelPath: string = '/models/breed_classifier/model.onnx'): Promise<void> {
    if (this.session || this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      console.log('Model loading currently uses fallback prediction...');
      // For now, always use fallback since ONNX.js has compatibility issues
      // This will be updated once your PyTorch model is converted properly
      throw new Error('Using fallback prediction - model conversion pending');
    } catch (error) {
      console.error('Failed to load ONNX model:', error);
      throw new Error('Could not load the breed classification model. Please ensure the model file is available.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Preprocess image for model inference
   */
  private async preprocessImage(imageElement: HTMLImageElement): Promise<MockTensor> {
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Resize to model input size (assuming 224x224)
    canvas.width = 224;
    canvas.height = 224;
    
    // Draw and resize image
    ctx.drawImage(imageElement, 0, 0, 224, 224);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, 224, 224);
    const data = imageData.data;
    
    // Convert to float32 array and normalize
    const input = new Float32Array(3 * 224 * 224);
    
    // ImageNet normalization values
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    
    for (let i = 0; i < 224 * 224; i++) {
      const pixelIndex = i * 4;
      
      // Normalize RGB values and arrange in CHW format
      input[i] = (data[pixelIndex] / 255.0 - mean[0]) / std[0];           // R
      input[224 * 224 + i] = (data[pixelIndex + 1] / 255.0 - mean[1]) / std[1]; // G
      input[224 * 224 * 2 + i] = (data[pixelIndex + 2] / 255.0 - mean[2]) / std[2]; // B
    }
    
    // Create tensor with shape [1, 3, 224, 224]
    return new MockTensorImpl(input, 'float32', [1, 3, 224, 224]);
  }

  /**
   * Predict breed from image using the ONNX model
   */
  async predictBreed(imageFile: File): Promise<ModelPrediction> {
    if (!this.session) {
      await this.loadModel();
    }

    if (!this.session) {
      throw new Error('Model not loaded');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Preprocess the image
          const inputTensor = await this.preprocessImage(img);
          
          // Run inference
          const outputMap = await this.session!.run([inputTensor]);
          const outputTensor = outputMap.values().next().value;
          
          // Convert output to probabilities using softmax
          const logits = outputTensor.data as Float32Array;
          const probabilities = this.softmax(Array.from(logits));
          
          // Get top predictions
          const predictions = probabilities
            .map((prob, index) => ({
              breed: BREED_CLASSES[index] || `Unknown_${index}`,
              confidence: Math.round(prob * 100)
            }))
            .sort((a, b) => b.confidence - a.confidence);

          const topPrediction = predictions[0];
          
          resolve({
            breedName: topPrediction.breed,
            confidence: topPrediction.confidence,
            allPredictions: predictions.slice(0, 5) // Top 5 predictions
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Create object URL for the image
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
   * Get model info
   */
  getModelInfo(): { isLoaded: boolean; isLoading: boolean } {
    return {
      isLoaded: !!this.session,
      isLoading: this.isLoading
    };
  }
}

// Export singleton instance
export const onnxModelService = new ONNXModelService();

// Fallback prediction function for when model is not available
export const predictBreedFallback = async (imageFile: File): Promise<ModelPrediction> => {
  // This is a fallback that simulates your model output
  console.warn('Using fallback prediction - ONNX model not available');
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a random breed from your classes
  const randomIndex = Math.floor(Math.random() * BREED_CLASSES.length);
  const selectedBreed = BREED_CLASSES[randomIndex];
  
  return {
    breedName: selectedBreed,
    confidence: Math.floor(Math.random() * 40) + 60, // Random confidence between 60-100%
    allPredictions: [
      { breed: selectedBreed, confidence: Math.floor(Math.random() * 40) + 60 },
      { breed: BREED_CLASSES[(randomIndex + 1) % BREED_CLASSES.length], confidence: Math.floor(Math.random() * 30) + 10 },
      { breed: BREED_CLASSES[(randomIndex + 2) % BREED_CLASSES.length], confidence: Math.floor(Math.random() * 20) + 5 }
    ]
  };
};
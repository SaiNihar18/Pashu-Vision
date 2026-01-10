import * as tf from '@tensorflow/tfjs';
// Note: ONNX.js import removed due to compatibility issues - using TensorFlow.js instead

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

class CustomModelService {
  private model: tf.LayersModel | null = null;
  private isLoading = false;

  /**
   * Load the custom model from the .pth file
   * Note: Since .pth is PyTorch format, you'll need to convert it to TensorFlow.js format
   * You can use the following command to convert:
   * tensorflowjs_converter --input_format=pytorch --output_format=tfjs_layers_model /path/to/model.pth /path/to/tfjs_model
   */
  async loadModel(modelPath: string = '/models/breed_classifier'): Promise<void> {
    if (this.model || this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      console.log('Loading custom breed classification model...');
      this.model = await tf.loadLayersModel(`${modelPath}/model.json`);
      console.log('Custom model loaded successfully');
    } catch (error) {
      console.error('Failed to load custom model:', error);
      throw new Error('Could not load the custom breed classification model. Please ensure the model files are available.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Preprocess image for model inference
   */
  private preprocessImage(imageElement: HTMLImageElement): tf.Tensor {
    // Convert image to tensor and preprocess
    // Adjust these parameters based on your model's requirements
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224]) // Resize to model input size
      .toFloat()
      .div(255.0) // Normalize to [0, 1]
      .expandDims(0); // Add batch dimension

    return tensor;
  }

  /**
   * Predict breed from image using the custom model
   */
  async predictBreed(imageFile: File): Promise<ModelPrediction> {
    if (!this.model) {
      await this.loadModel();
    }

    if (!this.model) {
      throw new Error('Model not loaded');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Preprocess the image
          const preprocessed = this.preprocessImage(img);
          
          // Make prediction
          const prediction = this.model!.predict(preprocessed) as tf.Tensor;
          const scores = await prediction.data();
          
          // Convert scores to probabilities
          const probabilities = Array.from(scores);
          
          // Get top predictions
          const predictions = probabilities
            .map((prob, index) => ({
              breed: BREED_CLASSES[index] || `Unknown_${index}`,
              confidence: Math.round((prob as number) * 100)
            }))
            .sort((a, b) => b.confidence - a.confidence);

          const topPrediction = predictions[0];
          
          // Clean up tensors
          preprocessed.dispose();
          prediction.dispose();

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
   * Get model info
   */
  getModelInfo(): { isLoaded: boolean; isLoading: boolean } {
    return {
      isLoaded: !!this.model,
      isLoading: this.isLoading
    };
  }
}

// Export singleton instance
export const customModelService = new CustomModelService();

// Fallback prediction function for when model is not available
export const predictBreedFallback = async (imageFile: File): Promise<ModelPrediction> => {
  // This is a fallback that returns a mock prediction
  // You can customize this based on your needs
  console.warn('Using fallback prediction - custom model not available');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        breedName: 'Murrah', // Default prediction
        confidence: 85,
        allPredictions: [
          { breed: 'Murrah', confidence: 85 },
          { breed: 'Mehsana', confidence: 12 },
          { breed: 'Banni', confidence: 3 }
        ]
      });
    }, 1000); // Simulate processing time
  });
};
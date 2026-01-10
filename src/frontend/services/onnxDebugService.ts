// Debug service for ONNX loading issues
import * as ort from 'onnxruntime-web';

export class ONNXDebugService {
  static async testModelLoading(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('🔧 Debug: Starting ONNX model loading test...');
      
      // Step 1: Configure ONNX Runtime
      console.log('🔧 Debug: Configuring ONNX Runtime...');
      ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
      ort.env.wasm.numThreads = 1;
      ort.env.logLevel = 'warning';
      
      // Step 2: Check model file accessibility
      console.log('🔧 Debug: Checking model file...');
      const modelPath = '/models/breed_classifier/breed_classifier.onnx';
      
      try {
        const response = await fetch(modelPath, { method: 'HEAD' });
        console.log('🔧 Debug: Model file response:', {
          status: response.status,
          ok: response.ok,
          size: response.headers.get('content-length'),
          type: response.headers.get('content-type')
        });
        
        if (!response.ok) {
          return {
            success: false,
            error: `Model file not accessible. HTTP ${response.status}: ${response.statusText}`,
            details: { status: response.status, statusText: response.statusText }
          };
        }
      } catch (fetchError) {
        return {
          success: false,
          error: `Failed to access model file: ${fetchError}`,
          details: { fetchError: fetchError instanceof Error ? fetchError.message : fetchError }
        };
      }
      
      // Step 3: Try different ONNX execution providers
      console.log('🔧 Debug: Testing different execution providers...');
      
      const providers = [
        { name: 'wasm', config: { executionProviders: ['wasm'] } },
        { name: 'cpu', config: { executionProviders: ['cpu'] } },
        { name: 'webgl', config: { executionProviders: ['webgl', 'cpu'] } }
      ];
      
      for (const provider of providers) {
        try {
          console.log(`🔧 Debug: Trying ${provider.name} provider...`);
          const session = await ort.InferenceSession.create(modelPath, provider.config);
          console.log(`✅ Success with ${provider.name} provider!`);
          
          return {
            success: true,
            details: {
              provider: provider.name,
              inputNames: session.inputNames,
              outputNames: session.outputNames
            }
          };
        } catch (providerError) {
          console.log(`❌ Failed with ${provider.name}: ${providerError}`);
          continue;
        }
      }
      
      return {
        success: false,
        error: 'All execution providers failed',
        details: { message: 'Tried wasm, cpu, and webgl providers' }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error: ${error}`,
        details: { 
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      };
    }
  }
}
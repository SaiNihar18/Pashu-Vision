import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.CUSTOM_MODEL_PATH': JSON.stringify(env.CUSTOM_MODEL_PATH || '/models/breed_classifier'),
        'process.env.USE_CUSTOM_MODEL': JSON.stringify(env.USE_CUSTOM_MODEL === 'true'),
        'process.env.MODEL_CONFIDENCE_THRESHOLD': JSON.stringify(parseInt(env.MODEL_CONFIDENCE_THRESHOLD || '60')),
        'process.env.FALLBACK_TO_GEMINI': JSON.stringify(env.FALLBACK_TO_GEMINI === 'true')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src/frontend'),
        }
      },
      optimizeDeps: {
        include: ['@tensorflow/tfjs', 'onnxruntime-web']
      },
      server: {
        host: true,
        ...(env.VITE_ALLOWED_HOST
          ? { allowedHosts: [env.VITE_ALLOWED_HOST] }
          : {}),
        proxy: {
          '/api': {
            target: env.VITE_GEMINI_API_BASE || 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              onnx: ['onnxruntime-web']
            }
          }
        },
        chunkSizeWarningLimit: 1000 // Increase warning limit for large ONNX files
      },
      // Handle ONNX runtime Web Assembly
      assetsInclude: ['**/*.wasm', '**/*.onnx']
    };
});
